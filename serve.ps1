<#
.SYNOPSIS
    Minimal static web server for previewing the exported Stasiosdesign site locally.

.DESCRIPTION
    The site is a plain static site, so any web server will do. This script exists
    because the site must be served over HTTP (not opened with file://) for a few
    things to work: the page-transition Lottie JSON is loaded with XHR, and AVIF /
    WebP / SVG assets need correct MIME types.

    Behaviour matches the Vercel deployment (see vercel.json), so the clean URLs
    the pages link to resolve the same way locally:
      /            -> index.html
      /work        -> work.html      (extensionless URLs resolve to .html)
      /work.html   -> work.html
      missing path -> 404.html with a 404 status

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\serve.ps1
    powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 8080
#>
[CmdletBinding()]
param(
    [int]$Port = 5173,
    [string]$Root
)

$ErrorActionPreference = 'Stop'

if (-not $Root) {
    $here = $PSScriptRoot
    if (-not $here) { $here = Split-Path -Parent $MyInvocation.MyCommand.Definition }
    if (-not $here) { $here = (Get-Location).ProviderPath }
    $Root = $here
}

if (-not (Test-Path -LiteralPath $Root)) { throw "Site root not found: $Root" }
$Root = (Resolve-Path -LiteralPath $Root).ProviderPath

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.htm'  = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'text/javascript; charset=utf-8'
    '.mjs'  = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.webp' = 'image/webp'
    '.avif' = 'image/avif'
    '.ico'  = 'image/x-icon'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.ttf'  = 'font/ttf'
    '.otf'  = 'font/otf'
    '.eot'  = 'application/vnd.ms-fontobject'
    '.mp4'  = 'video/mp4'
    '.webm' = 'video/webm'
    '.txt'  = 'text/plain; charset=utf-8'
    '.xml'  = 'application/xml; charset=utf-8'
    '.pdf'  = 'application/pdf'
}

# Resolve a request path to a file on disk, mirroring static-host conventions.
function Resolve-RequestPath {
    param([string]$UrlPath)

    $rel = [System.Uri]::UnescapeDataString($UrlPath).TrimStart('/')
    $rel = $rel -replace '/', '\'
    if ($rel -eq '') { $rel = 'index.html' }

    $candidates = @($rel)
    if (-not [System.IO.Path]::HasExtension($rel)) {
        $candidates += "$rel.html"
        $candidates += (Join-Path $rel 'index.html')
    }

    foreach ($c in $candidates) {
        $full = [System.IO.Path]::GetFullPath((Join-Path $Root $c))
        # Refuse anything that escapes the site root.
        if (-not $full.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) { continue }
        if (Test-Path -LiteralPath $full -PathType Leaf) { return $full }
    }
    return $null
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try {
    $listener.Start()
} catch {
    throw "Could not listen on http://localhost:$Port/ - $($_.Exception.Message)"
}

Write-Host ""
Write-Host "  Stasiosdesign - serving $Root"
Write-Host "  http://localhost:$Port/"
Write-Host "  Ctrl+C to stop"
Write-Host ""

try {
    while ($listener.IsListening) {
        $context  = $listener.GetContext()
        $request  = $context.Request
        $response = $context.Response
        $status   = 200

        try {
            $file = Resolve-RequestPath $request.Url.AbsolutePath
            if (-not $file) {
                $status = 404
                $notFound = Join-Path $Root '404.html'
                if (Test-Path -LiteralPath $notFound -PathType Leaf) { $file = $notFound }
            }

            if ($file) {
                $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
                $type = $mime[$ext]
                if (-not $type) { $type = 'application/octet-stream' }

                $bytes = [System.IO.File]::ReadAllBytes($file)
                $response.StatusCode    = $status
                $response.ContentType   = $type
                $response.ContentLength64 = $bytes.Length
                $response.Headers.Add('Cache-Control', 'no-cache')
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $bytes = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
                $response.StatusCode  = 404
                $response.ContentType = 'text/plain; charset=utf-8'
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } catch {
            $msg = [System.Text.Encoding]::UTF8.GetBytes("500 Internal Server Error`n$($_.Exception.Message)")
            $response.StatusCode  = 500
            $response.ContentType = 'text/plain; charset=utf-8'
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
            $status = 500
        } finally {
            Write-Host ("  {0,-3} {1}" -f $status, $request.Url.AbsolutePath)
            $response.OutputStream.Close()
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}

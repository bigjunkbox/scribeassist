Add-Type -AssemblyName System.Speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$absolutePath = Convert-Path "test-assets"
$outputFile = Join-Path $absolutePath "google-rocks.wav"
$speak.SetOutputToWaveFile($outputFile)
$speak.Speak("Google Rocks")
$speak.Dispose()
Write-Host "Audio generated at $outputFile"

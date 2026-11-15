# Generate efek suara game dengan Higgsfield Seed Audio, lalu simpan ke public/sfx/<nama>.mp3
$ErrorActionPreference = "Continue"
$out = Join-Path $PSScriptRoot "..\public\sfx"
New-Item -ItemType Directory -Force $out | Out-Null

$sfx = [ordered]@{
  pickup  = "Short cute sparkly pickup sound for a cozy game, a bright two-note chime with a soft twinkle, under one second, no music, clean"
  water   = "Short sound of watering plants with a small watering can, gentle water pouring and splashing on soil, about one second, cozy game sound effect"
  plant   = "Short soft sound of digging into garden soil with a small trowel and patting the dirt, cozy farming game sound effect, under one second"
  harvest = "Short satisfying harvest pop sound, plucking crops from the ground with a happy little sparkle, cozy farming game sound effect"
  oven    = "Short friendly kitchen oven timer ding, a warm bell ding like a toaster oven finishing, cozy cooking game sound effect"
  coins   = "Short cheerful coin and cash register sound, a few small coins clinking with a soft cha-ching, cozy shop game sound effect"
  door    = "Short shop door bell, a small brass bell jingling as a shop door opens, cozy bakery, sound effect"
  click   = "Very short soft UI click, a gentle wooden pop for a cute mobile game button, under a quarter second"
  letter  = "Short magical sound of opening a love letter, paper envelope unfolding with a soft romantic sparkle chime, cozy game sound effect"
  sleep   = "Short gentle lullaby music box jingle, four soft descending notes, for going to sleep in a cozy game, about three seconds"
  eat     = "Short cute munching sound of taking a bite of cake, soft crunchy nom nom, cozy game sound effect, about one second"
  wake    = "Short bright morning jingle with soft bird chirps, a happy rising three-note chime for a new day in a cozy farming game, about two seconds"
  ambience = "Calm daytime ambience of a small cozy town park, gentle birdsong, soft breeze through leaves, distant fountain water, peaceful, no music, no voices, seamless loop, about twenty seconds"
}

foreach ($name in $sfx.Keys) {
  $file = Join-Path $out "$name.mp3"
  if (Test-Path $file) { "${name}: sudah ada"; continue }
  $url = higgsfield generate create seed_audio --prompt $sfx[$name] --format mp3 --sample_rate 44100 --wait 2>&1 | Select-Object -Last 1
  if ("$url" -match '^https://') {
    Invoke-WebRequest $url -OutFile $file
    "${name}: ok"
  } else {
    "${name}: GAGAL -> $url"
  }
}
higgsfield account status

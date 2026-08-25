# Petty static audio migration status

Started: 2026-08-25

Goal: materialize the currently loaded Petty speech lines as local MP3 assets under `/assets/petty-audio/`, using the same FNV-1a text hash that `petty-static-audio.js` already expects.

Current transport order: local static MP3 -> runtime ElevenLabs audio -> clean unavailable handling.

This file tracks generation/verification progress while the binary batch is created.
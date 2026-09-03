package com.pettygamesstudios.ninetynineimpossible;

import android.media.AudioAttributes;
import android.media.SoundPool;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@CapacitorPlugin(name = "N99Sfx")
public class N99SfxPlugin extends Plugin {
    private SoundPool soundPool;
    private final Object lock = new Object();
    private final Map<String, Integer> sounds = new HashMap<>();
    private final Set<Integer> loaded = new HashSet<>();
    private final Map<Integer, List<PendingPlay>> pending = new HashMap<>();

    private static class PendingPlay {
        final PluginCall call;
        final String name;
        PendingPlay(PluginCall call, String name) {
            this.call = call;
            this.name = name;
        }
    }

    @Override
    public void load() {
        AudioAttributes attributes = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();

        soundPool = new SoundPool.Builder()
            .setMaxStreams(4)
            .setAudioAttributes(attributes)
            .build();

        soundPool.setOnLoadCompleteListener((pool, soundId, status) -> {
            List<PendingPlay> waiting;
            synchronized (lock) {
                if (status == 0) loaded.add(soundId);
                waiting = pending.remove(soundId);
            }
            if (waiting == null) return;
            if (status != 0) {
                for (PendingPlay item : waiting) item.call.reject("Native SFX failed to load");
                return;
            }
            for (PendingPlay item : waiting) playLoaded(item.call, item.name, soundId);
        });

        sounds.put("fail", soundPool.load(getContext(), R.raw.n99_fail, 1));
        sounds.put("win", soundPool.load(getContext(), R.raw.n99_win, 1));
        sounds.put("perfect", soundPool.load(getContext(), R.raw.n99_perfect, 1));
    }

    @PluginMethod
    public void play(PluginCall call) {
        String name = call.getString("name");
        if (name == null || !sounds.containsKey(name)) {
            call.reject("Unknown SFX");
            return;
        }
        if (soundPool == null) {
            call.reject("Native SFX unavailable");
            return;
        }

        int soundId = sounds.get(name);
        synchronized (lock) {
            if (!loaded.contains(soundId)) {
                pending.computeIfAbsent(soundId, ignored -> new ArrayList<>())
                    .add(new PendingPlay(call, name));
                return;
            }
        }
        playLoaded(call, name, soundId);
    }

    private void playLoaded(PluginCall call, String name, int soundId) {
        float volume = "perfect".equals(name) ? 0.75f : 0.60f;
        int streamId = soundPool.play(soundId, volume, volume, 1, 0, 1.0f);
        if (streamId == 0) {
            call.reject("Native SFX play failed");
            return;
        }
        JSObject result = new JSObject();
        result.put("name", name);
        result.put("streamId", streamId);
        result.put("native", true);
        call.resolve(result);
    }
}

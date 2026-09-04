package com.pettygamesstudios.ninetynineimpossible;

import android.media.AudioAttributes;
import android.media.SoundPool;
import android.util.Log;
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
    private static final String TAG = "N99Sfx";
    private SoundPool soundPool;
    private final Object lock = new Object();
    private final Map<String, Integer> sounds = new HashMap<>();
    private final Set<Integer> loaded = new HashSet<>();
    private final Map<Integer, List<PendingPlay>> pending = new HashMap<>();
    private volatile String lastStage = "class-created";
    private volatile String lastName = "";
    private volatile int lastSoundId = 0;
    private volatile int lastLoadStatus = -999;
    private volatile int lastStreamId = -999;

    private static class PendingPlay {
        final PluginCall call;
        final String name;
        PendingPlay(PluginCall call, String name) {
            this.call = call;
            this.name = name;
        }
    }

    private void stage(String value) {
        lastStage = value;
        Log.i(TAG, value);
    }

    private JSObject diagnosticPayload() {
        JSObject result = new JSObject();
        result.put("stage", lastStage);
        result.put("name", lastName);
        result.put("soundId", lastSoundId);
        result.put("loadStatus", lastLoadStatus);
        result.put("streamId", lastStreamId);
        result.put("soundPoolReady", soundPool != null);
        synchronized (lock) {
            result.put("loadedCount", loaded.size());
            result.put("knownCount", sounds.size());
            result.put("pendingCount", pending.values().stream().mapToInt(List::size).sum());
        }
        return result;
    }

    @Override
    public void load() {
        stage("native:load:entered");
        AudioAttributes attributes = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();

        soundPool = new SoundPool.Builder()
            .setMaxStreams(4)
            .setAudioAttributes(attributes)
            .build();
        stage("native:soundpool:created");

        soundPool.setOnLoadCompleteListener((pool, soundId, status) -> {
            lastSoundId = soundId;
            lastLoadStatus = status;
            stage("native:load-complete:id=" + soundId + ":status=" + status);
            List<PendingPlay> waiting;
            synchronized (lock) {
                if (status == 0) loaded.add(soundId);
                waiting = pending.remove(soundId);
            }
            if (waiting == null) return;
            if (status != 0) {
                for (PendingPlay item : waiting) item.call.reject("Native SFX failed to load; status=" + status);
                return;
            }
            for (PendingPlay item : waiting) playLoaded(item.call, item.name, soundId);
        });

        sounds.put("fail", soundPool.load(getContext(), R.raw.n99_fail, 1));
        sounds.put("win", soundPool.load(getContext(), R.raw.n99_win, 1));
        sounds.put("perfect", soundPool.load(getContext(), R.raw.n99_perfect, 1));
        stage("native:load-requested:fail=" + sounds.get("fail") + ":win=" + sounds.get("win") + ":perfect=" + sounds.get("perfect"));
    }

    @PluginMethod
    public void diagnostics(PluginCall call) {
        call.resolve(diagnosticPayload());
    }

    @PluginMethod
    public void play(PluginCall call) {
        String name = call.getString("name");
        lastName = name == null ? "" : name;
        stage("native:play:entered:" + lastName);
        if (name == null || !sounds.containsKey(name)) {
            stage("native:play:unknown-name");
            call.reject("Unknown SFX");
            return;
        }
        if (soundPool == null) {
            stage("native:play:no-soundpool");
            call.reject("Native SFX unavailable");
            return;
        }

        int soundId = sounds.get(name);
        lastSoundId = soundId;
        synchronized (lock) {
            if (!loaded.contains(soundId)) {
                stage("native:play:queued:id=" + soundId);
                pending.computeIfAbsent(soundId, ignored -> new ArrayList<>())
                    .add(new PendingPlay(call, name));
                return;
            }
        }
        playLoaded(call, name, soundId);
    }

    private void playLoaded(PluginCall call, String name, int soundId) {
        lastName = name;
        lastSoundId = soundId;
        stage("native:soundpool-play:before:id=" + soundId);
        float volume = "perfect".equals(name) ? 0.75f : 0.60f;
        int streamId = soundPool.play(soundId, volume, volume, 1, 0, 1.0f);
        lastStreamId = streamId;
        stage("native:soundpool-play:after:stream=" + streamId);
        if (streamId == 0) {
            call.reject("Native SFX play failed; streamId=0");
            return;
        }
        JSObject result = diagnosticPayload();
        result.put("native", true);
        call.resolve(result);
    }
}

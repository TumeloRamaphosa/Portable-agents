package com.studex.studbot.pulse

import android.content.Context
import com.studex.studbot.state.StudbotState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class PulseRepository(
    private val context: Context,
    private val state: StudbotState,
) {
    private val pulseFile: File
        get() = File(context.filesDir, "pulse.txt")

    private val outDir: File
        get() = File(context.filesDir, "out").also { it.mkdirs() }

    val autonomousNote: File
        get() = File(outDir, "AUTONOMOUS_NOTE.md")

    val actionsLog: File
        get() = File(outDir, "actions.log")

    suspend fun ensureDefaults() = withContext(Dispatchers.IO) {
        if (!pulseFile.exists()) {
            pulseFile.writeText(
                """
                # Edit while Studbot watches
                cpu_temp_c=62
                status=ok

                """.trimIndent(),
            )
        }
        state.updatePulse(pulseFile.readText())
    }

    suspend fun readRaw(): String = withContext(Dispatchers.IO) {
        if (!pulseFile.exists()) ensureDefaults()
        pulseFile.readText()
    }

    suspend fun writeRaw(text: String) = withContext(Dispatchers.IO) {
        pulseFile.writeText(text)
        state.updatePulse(text)
        onPulseAnomaly()
    }

    fun onExternalPulseChange(raw: String) {
        state.updatePulse(raw)
        onPulseAnomaly()
    }

    private fun onPulseAnomaly() {
        if (state.pulse.value.isAnomaly()) {
            writeAutonomousOutputs()
        }
    }

    private fun writeAutonomousOutputs() {
        val p = state.pulse.value
        val ts = java.time.Instant.now().toString()
        val reasons = buildList {
            if (p.cpuTempC != null && p.cpuTempC > 70f) add("cpu_temp_c=${p.cpuTempC} > 70")
            if (p.status.lowercase() != "ok") add("status=${p.status} != ok")
        }.joinToString("; ")

        val note =
            """
            # Autonomous agent note

            **Detected:** $ts

            ## Pulse

            - cpu_temp_c: ${p.cpuTempC ?: "unknown"}
            - status: ${p.status}

            ## Anomaly

            $reasons

            """.trimIndent()

        autonomousNote.writeText(note)
        actionsLog.appendText("$ts ANOMALY $reasons\n")
        state.recordAutonomousNote(note)
    }
}

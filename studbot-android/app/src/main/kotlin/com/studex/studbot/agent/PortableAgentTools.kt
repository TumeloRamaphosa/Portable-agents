package com.studex.studbot.agent

import com.google.adk.kt.annotations.Param
import com.google.adk.kt.annotations.Tool
import com.studex.studbot.state.StudbotState

/**
 * ADK @Tool surface for Studbot — NEEDLE, POV course, and pulse (Portable Agents).
 */
class PortableAgentTools(
    private val state: StudbotState,
    private val onPulseWrite: (String) -> Unit,
) {

    @Tool(
        name = "get_needle_status",
        description = "Returns NEEDLE compass bearing and the next course checkpoint.",
    )
    fun getNeedleStatus(): Map<String, Any> = state.needleStatusMap()

    @Tool(
        name = "get_course_status",
        description = "Returns current POV course checkpoint index and titles.",
    )
    fun getCourseStatus(): Map<String, Any> = state.courseStatusMap()

    @Tool(
        name = "advance_course",
        description = "Move forward one checkpoint in the first-person POV course.",
    )
    fun advanceCourse(): Map<String, Any> = state.advanceCourse()

    @Tool(
        name = "retreat_course",
        description = "Move back one checkpoint in the POV course.",
    )
    fun retreatCourse(): Map<String, Any> = state.retreatCourse()

    @Tool(
        name = "read_pulse",
        description = "Reads the device pulse.txt snapshot (cpu_temp_c, status).",
    )
    fun readPulse(): Map<String, Any> {
        val p = state.pulse.value
        return mapOf(
            "cpu_temp_c" to (p.cpuTempC ?: "unknown"),
            "status" to p.status,
            "anomaly" to p.isAnomaly(),
        )
    }

    @Tool(
        name = "set_pulse_field",
        description = "Updates one field in pulse.txt (cpu_temp_c or status).",
    )
    fun setPulseField(
        @Param("Field name: cpu_temp_c or status") field: String,
        @Param("New value") value: String,
    ): Map<String, Any> {
        val current = state.pulse.value.raw.ifBlank { "cpu_temp_c=62\nstatus=ok\n" }
        val lines = current.lines().toMutableList()
        val key = field.trim().lowercase()
        var replaced = false
        for (i in lines.indices) {
            if (lines[i].trim().startsWith("$key=")) {
                lines[i] = "$key=$value"
                replaced = true
            }
        }
        if (!replaced) lines.add("$key=$value")
        val merged = lines.joinToString("\n") + "\n"
        onPulseWrite(merged)
        return readPulse()
    }
}

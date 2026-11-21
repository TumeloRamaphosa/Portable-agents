package com.studex.studbot.state

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class CourseStep(
    val title: String,
    val bearing: Float,
    val body: String,
)

data class PulseSnapshot(
    val cpuTempC: Float?,
    val status: String,
    val raw: String,
) {
    fun isAnomaly(): Boolean =
        (cpuTempC != null && cpuTempC > 70f) || status.lowercase() != "ok"
}

class StudbotState {
    private val _needleBearing = MutableStateFlow(0f)
    val needleBearing: StateFlow<Float> = _needleBearing.asStateFlow()

    private val _courseIndex = MutableStateFlow(0)
    val courseIndex: StateFlow<Int> = _courseIndex.asStateFlow()

    private val _steps = MutableStateFlow<List<CourseStep>>(emptyList())
    val steps: StateFlow<List<CourseStep>> = _steps.asStateFlow()

    private val _pulse = MutableStateFlow(PulseSnapshot(null, "ok", ""))
    val pulse: StateFlow<PulseSnapshot> = _pulse.asStateFlow()

    private val _lastAutonomousNote = MutableStateFlow<String?>(null)
    val lastAutonomousNote: StateFlow<String?> = _lastAutonomousNote.asStateFlow()

    fun setSteps(list: List<CourseStep>) {
        _steps.value = list
        syncNeedleToNextCheckpoint()
    }

    fun setNeedleBearing(degrees: Float) {
        _needleBearing.value = ((degrees % 360f) + 360f) % 360f
    }

    fun advanceCourse(): Map<String, Any> {
        val max = (_steps.value.size - 1).coerceAtLeast(0)
        if (_courseIndex.value < max) {
            _courseIndex.value += 1
            syncNeedleToNextCheckpoint()
        }
        return courseStatusMap()
    }

    fun retreatCourse(): Map<String, Any> {
        if (_courseIndex.value > 0) {
            _courseIndex.value -= 1
            syncNeedleToNextCheckpoint()
        }
        return courseStatusMap()
    }

    fun updatePulse(raw: String) {
        val data = parsePulse(raw)
        val temp = data["cpu_temp_c"]?.toFloatOrNull()
        val status = data["status"] ?: "ok"
        _pulse.value = PulseSnapshot(temp, status, raw)
    }

    fun recordAutonomousNote(markdown: String) {
        _lastAutonomousNote.value = markdown
    }

    private fun syncNeedleToNextCheckpoint() {
        val steps = _steps.value
        if (steps.isEmpty()) return
        val nextIndex = (_courseIndex.value + 1).coerceAtMost(steps.size - 1)
        setNeedleBearing(steps[nextIndex].bearing)
    }

    fun courseStatusMap(): Map<String, Any> {
        val steps = _steps.value
        val idx = _courseIndex.value
        val current = steps.getOrNull(idx)
        val next = steps.getOrNull(idx + 1)
        return mapOf(
            "checkpoint" to (idx + 1),
            "total" to steps.size,
            "current_title" to (current?.title ?: ""),
            "next_title" to (next?.title ?: "complete"),
            "needle_bearing_deg" to _needleBearing.value,
        )
    }

    fun needleStatusMap(): Map<String, Any> {
        val steps = _steps.value
        val idx = _courseIndex.value
        val next = steps.getOrNull(idx + 1)
        val ahead = (steps.size - idx - 1).coerceAtLeast(0)
        return mapOf(
            "bearing_deg" to _needleBearing.value,
            "next_checkpoint" to (next?.title ?: "Path complete"),
            "steps_ahead" to ahead,
        )
    }

    companion object {
        fun parsePulse(text: String): Map<String, String> {
            val out = linkedMapOf<String, String>()
            text.lineSequence().forEach { line ->
                val trimmed = line.trim()
                if (trimmed.isEmpty() || trimmed.startsWith("#")) return@forEach
                val parts = trimmed.split("=", limit = 2)
                if (parts.size == 2) out[parts[0].trim()] = parts[1].trim()
            }
            return out
        }
    }
}

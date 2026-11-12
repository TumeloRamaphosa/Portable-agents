package com.studex.studbot.agent

import com.studex.studbot.state.StudbotState

/** Offline fallback when no on-device ADK model is loaded yet. */
object LocalStudbotResponder {
    fun reply(message: String, state: StudbotState, tools: PortableAgentTools): String {
        val q = message.lowercase()
        return when {
            q.contains("needle") || q.contains("bearing") || q.contains("compass") ->
                "NEEDLE: ${tools.getNeedleStatus()}"
            q.contains("advance") || q.contains("forward") -> {
                tools.advanceCourse()
                "Advanced. ${tools.getCourseStatus()}"
            }
            q.contains("retreat") || q.contains("back") -> {
                tools.retreatCourse()
                "Retreated. ${tools.getCourseStatus()}"
            }
            q.contains("course") || q.contains("checkpoint") || q.contains("pov") ->
                "Course: ${tools.getCourseStatus()}"
            q.contains("pulse") || q.contains("temp") || q.contains("anomaly") ->
                "Pulse: ${tools.readPulse()}"
            q.contains("help") ->
                "Studbot (local mode): ask about NEEDLE, POV course, or pulse. " +
                    "Load a LiteRT-LM .litertlm model for full ADK Kotlin on-device agent."
            else ->
                "Local Studbot — no LiteRT-LM model loaded. Try NEEDLE, course, or pulse. " +
                    "See studbot-android/README.md for ADK 1.0 on-device setup."
        }
    }
}

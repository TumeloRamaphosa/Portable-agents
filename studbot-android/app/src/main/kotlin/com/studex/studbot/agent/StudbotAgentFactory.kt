package com.studex.studbot.agent

import android.content.Context
import com.google.adk.kt.agents.Instruction
import com.google.adk.kt.agents.LlmAgent
import com.google.adk.kt.litertlm.LiteRtLmModel
import com.google.ai.edge.litertlm.Backend
import com.google.ai.edge.litertlm.EngineConfig
import com.studex.studbot.state.StudbotState
import java.io.File

object StudbotAgentFactory {
    const val AGENT_NAME = "studbot"

    fun createLiteRtAgent(
        model: LiteRtLmModel,
        state: StudbotState,
        onPulseWrite: (String) -> Unit,
    ): LlmAgent =
        LlmAgent(
            name = AGENT_NAME,
            model = model,
            instruction =
                Instruction(
                    """
                    You are Studbot for Studex Portable Agents on Android. You run on-device via ADK Kotlin.
                    Keep replies short. Use tools for facts:
                    - NEEDLE / compass / bearing → get_needle_status
                    - POV course / checkpoints → get_course_status, advance_course, retreat_course
                    - pulse / temperature / anomaly → read_pulse, set_pulse_field
                    After tool calls, summarize what changed for the operator.
                    """.trimIndent(),
                ),
            tools = PortableAgentTools(state, onPulseWrite).generatedTools(),
        )

    fun openLiteRtModel(modelFile: File, cacheDir: File): LiteRtLmModel =
        LiteRtLmModel.create(
            EngineConfig(
                modelPath = modelFile.absolutePath,
                backend = Backend.CPU(),
                cacheDir = cacheDir.absolutePath,
            ),
            name = modelFile.name,
        )

    fun modelFile(context: Context): File =
        File(context.filesDir, "studbot-model.litertlm")
}

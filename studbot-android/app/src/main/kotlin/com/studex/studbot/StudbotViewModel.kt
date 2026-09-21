package com.studex.studbot

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.studex.studbot.agent.LocalStudbotResponder
import com.studex.studbot.agent.PortableAgentTools
import com.studex.studbot.agent.StudbotAgentFactory
import com.studex.studbot.pulse.PulseRepository
import com.studex.studbot.state.CourseStep
import com.studex.studbot.state.StudbotState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.File

class StudbotViewModel(app: Application) : AndroidViewModel(app) {
    val state = StudbotState()
    private val pulseRepo = PulseRepository(app, state)

    private val _tab = MutableStateFlow(0)
    val tab: StateFlow<Int> = _tab.asStateFlow()

    private val _messages = MutableStateFlow<List<String>>(listOf("Studbot: Portable Agents · ADK Kotlin on-device"))
    val messages: StateFlow<List<String>> = _messages.asStateFlow()

    private val _backendLabel = MutableStateFlow("local (load LiteRT-LM for ADK agent)")
    val backendLabel: StateFlow<String> = _backendLabel.asStateFlow()

    var draft by mutableStateOf("")
    var pulseDraft by mutableStateOf("")

    private val tools: PortableAgentTools =
        PortableAgentTools(state) { text ->
            viewModelScope.launch { pulseRepo.writeRaw(text) }
        }

    init {
        viewModelScope.launch {
            loadCourse()
            pulseRepo.ensureDefaults()
            pulseDraft = pulseRepo.readRaw()
            startPulseWatcher()
            if (StudbotAgentFactory.modelFile(app).exists()) {
                _backendLabel.value = "ADK + LiteRT-LM (model present — wire runner in next iteration)"
            }
        }
    }

    fun setTab(i: Int) {
        _tab.value = i
    }

    fun setDraft(v: String) {
        draft = v
    }

    fun setPulseDraft(v: String) {
        pulseDraft = v
    }

    fun sendMessage() {
        val text = draft.trim()
        if (text.isEmpty()) return
        _messages.value = _messages.value + "You: $text"
        draft = ""
        val reply = LocalStudbotResponder.reply(text, state, tools)
        _messages.value = _messages.value + "Studbot: $reply"
    }

    fun advanceCourse() {
        tools.advanceCourse()
    }

    fun retreatCourse() {
        tools.retreatCourse()
    }

    fun savePulse() {
        viewModelScope.launch {
            pulseRepo.writeRaw(pulseDraft)
        }
    }

    private suspend fun loadCourse() = withContext(Dispatchers.IO) {
        val json =
            getApplication<Application>().assets.open("course.json").bufferedReader().use(BufferedReader::readText)
        val root = JSONObject(json)
        val arr = root.getJSONArray("steps")
        val steps = buildList {
            for (i in 0 until arr.length()) {
                val o = arr.getJSONObject(i)
                add(
                    CourseStep(
                        title = o.getString("title"),
                        bearing = o.getDouble("bearing").toFloat(),
                        body = o.getString("body"),
                    ),
                )
            }
        }
        state.setSteps(steps)
    }

    private fun startPulseWatcher() {
        viewModelScope.launch(Dispatchers.IO) {
            val file = File(getApplication<Application>().filesDir, "pulse.txt")
            var last = ""
            while (true) {
                if (file.exists()) {
                    val raw = file.readText()
                    if (raw != last) {
                        last = raw
                        pulseRepo.onExternalPulseChange(raw)
                        pulseDraft = raw
                    }
                }
                kotlinx.coroutines.delay(500)
            }
        }
    }
}

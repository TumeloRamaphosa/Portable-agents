package com.studex.studbot.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.studex.studbot.StudbotViewModel

@Composable
fun StudbotApp(viewModel: StudbotViewModel) {
    val tab by viewModel.tab.collectAsState()
    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth().padding(8.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
            Button(onClick = { viewModel.setTab(0) }) { Text("Studbot") }
            Button(onClick = { viewModel.setTab(1) }) { Text("POV + NEEDLE") }
            Button(onClick = { viewModel.setTab(2) }) { Text("Pulse") }
        }
        when (tab) {
            0 -> ChatScreen(viewModel)
            1 -> PovScreen(viewModel)
            else -> PulseScreen(viewModel)
        }
    }
}

@Composable
private fun ChatScreen(viewModel: StudbotViewModel) {
    val messages by viewModel.messages.collectAsState()
    val backend by viewModel.backendLabel.collectAsState()
    Column(Modifier.fillMaxSize().padding(12.dp)) {
        Text("Backend: $backend", style = MaterialTheme.typography.labelSmall)
        LazyColumn(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(messages) { msg ->
                Card(Modifier.fillMaxWidth()) {
                    Text(msg, Modifier.padding(10.dp), style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = viewModel.draft,
                onValueChange = viewModel::setDraft,
                modifier = Modifier.weight(1f),
                placeholder = { Text("Ask Studbot…") },
            )
            Button(onClick = viewModel::sendMessage) { Text("Send") }
        }
    }
}

@Composable
private fun PovScreen(viewModel: StudbotViewModel) {
    val idx by viewModel.state.courseIndex.collectAsState()
    val steps by viewModel.state.steps.collectAsState()
    val bearing by viewModel.state.needleBearing.collectAsState()
    val step = steps.getOrNull(idx)
    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        NeedleCompass(bearingDegrees = bearing)
        Text("Checkpoint ${idx + 1} of ${steps.size}", style = MaterialTheme.typography.titleMedium)
        Text(step?.title ?: "", style = MaterialTheme.typography.headlineSmall)
        Text(step?.body ?: "", style = MaterialTheme.typography.bodyMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { viewModel.retreatCourse() }) { Text("Retreat") }
            Button(onClick = { viewModel.advanceCourse() }) { Text("Advance") }
        }
    }
}

@Composable
private fun PulseScreen(viewModel: StudbotViewModel) {
    val pulse by viewModel.state.pulse.collectAsState()
    val note by viewModel.state.lastAutonomousNote.collectAsState()
    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("pulse.txt (files dir)", style = MaterialTheme.typography.titleSmall)
        OutlinedTextField(
            value = viewModel.pulseDraft,
            onValueChange = viewModel::setPulseDraft,
            modifier = Modifier.fillMaxWidth().weight(1f),
        )
        Button(onClick = viewModel::savePulse) { Text("Save pulse") }
        Text("Anomaly: ${pulse.isAnomaly()}", color = if (pulse.isAnomaly()) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface)
        note?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
    }
}

package com.studex.studbot

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.studex.studbot.ui.StudbotApp
import com.studex.studbot.ui.theme.StudbotTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            StudbotTheme {
                val vm: StudbotViewModel = viewModel()
                StudbotApp(vm)
            }
        }
    }
}


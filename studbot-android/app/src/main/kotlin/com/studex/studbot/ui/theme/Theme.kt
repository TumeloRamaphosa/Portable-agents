package com.studex.studbot.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Obsidian = Color(0xFF0A0A0A)
private val Gold = Color(0xFFC9A84C)
private val Paper = Color(0xFFF5F1E8)

private val Scheme =
    darkColorScheme(
        primary = Gold,
        onPrimary = Obsidian,
        background = Obsidian,
        onBackground = Paper,
        surface = Color(0xFF111111),
        onSurface = Paper,
    )

@Composable
fun StudbotTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = Scheme, content = content)
}

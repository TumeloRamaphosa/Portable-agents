package com.studex.studbot.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.unit.dp
@Composable
fun NeedleCompass(
    bearingDegrees: Float,
    modifier: Modifier = Modifier,
) {
    val gold = Color(0xFFC9A84C)
    val dim = Color(0xFF5C594F)
    Canvas(modifier = modifier.size(160.dp)) {
        val c = center
        val r = size.minDimension / 2f * 0.85f
        drawCircle(color = dim, radius = r, center = c, style = androidx.compose.ui.graphics.drawscope.Stroke(width = 2f))
        rotate(bearingDegrees, c) {
            drawLine(color = gold, start = c, end = Offset(c.x, c.y - r), strokeWidth = 4f)
            drawCircle(color = gold, radius = 6f, center = c)
        }
    }
    Text(
        text = "NEEDLE ${bearingDegrees.toInt()}°",
        style = MaterialTheme.typography.labelSmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
}

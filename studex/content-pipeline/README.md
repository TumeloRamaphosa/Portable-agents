Studex Content Pipeline (faceless YouTube)
============================================

Owner: Studex Global Market / Studex Group
Status: spec v0.1, nothing built or run yet
Scope: produces finished faceless video drafts. It never uploads or posts.


What this is
------------
A chain of seven nodes that turns one topic brief into one finished video
file plus a publish draft. A person approves the draft before anything leaves
the machine.

    brief -> script -> shot_list -> image -> motion -> voice -> edit -> publish
                                                                      |
                                                    HUMAN APPROVAL GATE (required)
                                                                      |
                                                    upload adapter (disabled in v0.1)

The graph and the state machine are in pipeline.graph.txt.
The queue runner is in runner/outline.txt.
Each node has its own config spec in nodes/.


Two routes
----------
Every node has a paid route and a free route. The route is a single config
key per node (route: paid | free), so you can mix them. For example, paid
images with a free voice is fine.

  Node        Paid route                              Free / open-source route
  ----------  --------------------------------------  -----------------------------------------
  script      Claude API                              Ollama (local LLM)
  shot_list   Claude API                              Ollama (local LLM)
  image       Higgsfield image models (API)           ComfyUI + an open image model
  motion      Higgsfield image-to-video (API)         ComfyUI video model, or FFmpeg Ken Burns
  voice       paid TTS (Higgsfield audio if its API   Piper or Kokoro (local TTS)
              covers it; otherwise ElevenLabs)
  edit        DaVinci Resolve Studio (paid)           Kdenlive or DaVinci Resolve (free edition)
                                                      + FFmpeg for scripted assembly
  publish     manual, human gate                      manual, human gate

Open-source tools are listed alongside paid ones on purpose. Each free option
has a note in its node file about license and commercial-use limits, because
several popular open models are non-commercial.

Source status: the notes on Higgsfield pricing and Piper maintenance came
from secondary sources. Re-check both before budgeting or committing.


Studex notes
------------
- The launch plan (sections 4 and 5) was not in the sandbox when this spec
  was written. Every value that should come from that plan is marked
  [PLAN]. Fill those in before the first real run.
- Channel niche, language, target length and voice are all placeholders for
  now. Set them in the topic brief, not in the node files.
- Ship the free route first. It costs nothing to run and proves the chain
  end to end. Move a node to paid only when its output quality is the
  bottleneck.


Files
-----
  README.md                       this file
  pipeline.graph.txt              nodes, edges, job states, artifact layout
  nodes/01-script.txt             script node spec
  nodes/02-shot-list.txt          shot list node spec
  nodes/03-image.txt              image node spec
  nodes/04-motion.txt             motion node spec
  nodes/05-voice.txt              voice node spec
  nodes/06-edit.txt               edit node spec
  nodes/07-publish.txt            publish node spec (approval gate)
  runner/outline.txt              queue-driven runner outline


Not in scope for v0.1
---------------------
- Uploading to YouTube or any other platform
- Scheduling, comment replies, analytics pulls
- Multi-channel or multi-language fan-out (the brief format allows it later)
- Any use of a repository other than msitarzewski/agency-agents

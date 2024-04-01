import {
  env,
  Tensor,
  AutoTokenizer,
  SpeechT5ForTextToSpeech,
  SpeechT5HifiGan,
} from '@xenova/transformers'

// Disable local model checks
env.allowLocalModels = false

// Use the Singleton pattern to enable lazy construction of the pipeline.
class MyTextToSpeechPipeline {
  static BASE_URL =
    'https://huggingface.co/datasets/Xenova/cmu-arctic-xvectors-extracted/resolve/main/'

  static model_id = 'Xenova/speecht5_tts'
  static vocoder_id = 'Xenova/speecht5_hifigan'

  static tokenizer_instance = null
  static model_instance = null
  static vocoder_instance = null

  static async getInstance(progress_callback = null) {
    if (this.tokenizer_instance === null) {
      this.tokenizer = AutoTokenizer.from_pretrained(this.model_id, {
        progress_callback,
      })
    }

    if (this.model_instance === null) {
      this.model_instance = SpeechT5ForTextToSpeech.from_pretrained(
        this.model_id,
        {
          quantized: false,
          progress_callback,
        },
      )
    }

    if (this.vocoder_instance === null) {
      this.vocoder_instance = SpeechT5HifiGan.from_pretrained(this.vocoder_id, {
        quantized: false,
        progress_callback,
      })
    }

    return new Promise(async (resolve, reject) => {
      const result = await Promise.all([
        this.tokenizer,
        this.model_instance,
        this.vocoder_instance,
      ])
      self.postMessage({
        status: 'ready',
      })
      resolve(result)
    })
  }

  static async getSpeakerEmbeddings(speaker_id) {
    // e.g., `cmu_us_awb_arctic-wav-arctic_a0001`
    const speaker_embeddings_url = `${this.BASE_URL}${speaker_id}.bin`
    const speaker_embeddings = new Tensor(
      'float32',
      new Float32Array(
        await (await fetch(speaker_embeddings_url)).arrayBuffer(),
      ),
      [1, 512],
    )
    return speaker_embeddings
  }
}

// Mapping of cached speaker embeddings
const speaker_embeddings_cache = new Map()

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  // Load the pipeline
  const [tokenizer, model, vocoder] = await MyTextToSpeechPipeline.getInstance(
    (x) => {
      // We also add a progress callback so that we can track model loading.
      self.postMessage(x)
    },
  )

  // Tokenize the input
  const { input_ids } = tokenizer(event.data.text)

  // Load the speaker embeddings
  let speaker_embeddings = speaker_embeddings_cache.get(event.data.speaker_id)
  if (speaker_embeddings === undefined) {
    speaker_embeddings = await MyTextToSpeechPipeline.getSpeakerEmbeddings(
      event.data.speaker_id,
    )
    speaker_embeddings_cache.set(event.data.speaker_id, speaker_embeddings)
  }

  // Generate the waveform
  const { waveform } = await model.generate_speech(
    input_ids,
    speaker_embeddings,
    { vocoder },
  )

  // Encode the waveform as a WAV file
  const wav = encodeWAV(waveform.data)

  // Send the output back to the main thread
  self.postMessage({
    status: 'complete',
    output: new Blob([wav], { type: 'audio/wav' }),
  })
})

// Adapted from https://www.npmjs.com/package/audiobuffer-to-wav
export function encodeWAV(samples) {
  let offset = 44
  const buffer = new ArrayBuffer(offset + samples.length * 4)
  const view = new DataView(buffer)
  const sampleRate = 16000

  /* RIFF identifier */
  writeString(view, 0, 'RIFF')
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 4, true)
  /* RIFF type */
  writeString(view, 8, 'WAVE')
  /* format chunk identifier */
  writeString(view, 12, 'fmt ')
  /* format chunk length */
  view.setUint32(16, 16, true)
  /* sample format (raw) */
  view.setUint16(20, 3, true)
  /* channel count */
  view.setUint16(22, 1, true)
  /* sample rate */
  view.setUint32(24, sampleRate, true)
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true)
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 4, true)
  /* bits per sample */
  view.setUint16(34, 32, true)
  /* data chunk identifier */
  writeString(view, 36, 'data')
  /* data chunk length */
  view.setUint32(40, samples.length * 4, true)

  for (let i = 0; i < samples.length; ++i, offset += 4) {
    view.setFloat32(offset, samples[i], true)
  }

  return buffer
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; ++i) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

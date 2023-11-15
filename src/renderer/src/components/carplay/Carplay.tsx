import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  findDevice,
  requestDevice,
  CommandMapping,
} from 'node-carplay/web'
import JMuxer from 'jmuxer'
import { CarPlayWorker } from './worker/types'
import useCarplayAudio from './useCarplayAudio'
import { useCarplayTouch } from './useCarplayTouch'
import { ExtraConfig} from "../../../../main/Globals";

const width = window.innerWidth
const height = window.innerHeight

const RETRY_DELAY_MS = 15000



interface CarplayProps {
  receivingVideo: boolean
  setReceivingVideo: (receivingVideo: boolean) => void
  settings: ExtraConfig,
  command: string,
  commandCounter: number
}

function Carplay({ receivingVideo, setReceivingVideo, settings, command, commandCounter }: CarplayProps) {
  const [isPlugged, setPlugged] = useState(false)
  const [noDevice, setNoDevice] = useState(false)
  // const [receivingVideo, setReceivingVideo] = useState(false)
  const [jmuxer, setJmuxer] = useState<JMuxer | null>(null)
  const mainElem = useRef<HTMLDivElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const config = {
    fps: settings.fps,
    width: width,
    height: height,
    mediaDelay: settings.mediaDelay
  }
   const pathname = "/"
  console.log(pathname)

  const carplayWorker = useMemo(
    () =>
      new Worker(new URL('./worker/carplay.ts', import.meta.url), {
        type: 'module'
      }) as CarPlayWorker,
    []
  )

  const { processAudio, startRecording, stopRecording } = useCarplayAudio(carplayWorker, settings.microphone)

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  // subscribe to worker messages
  useEffect(() => {
    carplayWorker.onmessage = (ev) => {
      const { type } = ev.data
      switch (type) {
        case 'plugged':
          setPlugged(true)
          if(settings.piMost && settings?.most?.stream) {
            console.log("setting most stream")
            window.api.stream(settings.most.stream)
          }
          break
        case 'unplugged':
          setPlugged(false)
          break
        case 'video':
          // if document is hidden we dont need to feed frames
          if (!jmuxer || document.hidden) return
          if (!receivingVideo) {
            setReceivingVideo(true)
          }
          clearRetryTimeout()
          const { message: video } = ev.data
          jmuxer.feed({
            video: video.data,
            duration: 0
          })
          break
        case 'audio':
          clearRetryTimeout()

          const { message: audio } = ev.data
          processAudio(audio)
          break
        case 'media':
          //TODO: implement
          break
        case 'command':
          const {
            message: { value }
          } = ev.data
          switch (value) {
            case CommandMapping.startRecordAudio:
              startRecording()
              break
            case CommandMapping.stopRecordAudio:
              stopRecording()
              break
            case CommandMapping.requestHostUI:
              navigate('/settings')
          }
          break
        case 'failure':
          if (retryTimeoutRef.current == null) {
            console.error(
              `Carplay initialization failed -- Reloading page in ${RETRY_DELAY_MS}ms`,
            )
            retryTimeoutRef.current = setTimeout(() => {
              window.location.reload()
            }, RETRY_DELAY_MS)
          }
          break
      }
    }
  }, [carplayWorker, jmuxer, processAudio, clearRetryTimeout, receivingVideo, startRecording, stopRecording])

  // video init
  useEffect(() => {
    const jmuxer = new JMuxer({
      node: 'video',
      mode: 'video',
      fps: config.fps,
      flushingTime: 0,
      debug: false
    })
    setJmuxer(jmuxer)
    return () => {
      jmuxer.destroy()
    }
  }, [])

  useEffect(() => {
    const element = mainElem?.current
    if(!element) return;
    const observer = new ResizeObserver(() => {
      console.log("size change")
      carplayWorker.postMessage({type: 'frame'})
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, []);

  useEffect(() => {
    carplayWorker.postMessage({type: 'keyCommand', command: command})
  }, [commandCounter]);

  const checkDevice = useCallback(
    async (request: boolean = false) => {
      const device = request ? await requestDevice() : await findDevice()
      if (device) {
        console.log('starting in check')
        setNoDevice(false)
        carplayWorker.postMessage({ type: 'start', payload: config })
      } else {
        setNoDevice(true)
      }
    },
    [carplayWorker]
  )

  // usb connect/disconnect handling and device check
  useEffect(() => {
    navigator.usb.onconnect = async () => {
      checkDevice()
    }

    navigator.usb.ondisconnect = async () => {
      const device = await findDevice()
      if (!device) {
        carplayWorker.postMessage({ type: 'stop' })
        setNoDevice(true)
      }
    }

    //checkDevice()
  }, [carplayWorker, checkDevice])

  // const onClick = useCallback(() => {
  //   checkDevice(true)
  // }, [checkDevice])

  const sendTouchEvent = useCarplayTouch(carplayWorker, width, height)

  const isLoading = !noDevice && !receivingVideo

  return (
    <div
      style={pathname === '/' ? { height: '100%', touchAction: 'none' } : { display: 'none' }}
      id={'main'}
      className="App"
      ref={mainElem}
    >
      {(noDevice || isLoading) && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {noDevice && (
            <button rel="noopener noreferrer">
              Plug-In Carplay Dongle and Press
            </button>
          )}
          {isLoading && (
            <div>LOADING...</div>
          )}
        </div>
      )}
      <div
        id="videoContainer"
        onPointerDown={sendTouchEvent}
        onPointerMove={sendTouchEvent}
        onPointerUp={sendTouchEvent}
        onPointerCancel={sendTouchEvent}
        onPointerOut={sendTouchEvent}
        style={{
          height: '100%',
          width: '100%',
          padding: 0,
          margin: 0,
          display: 'flex'
        }}
      >
        <video id="video" style={isPlugged ? { height: '100%' } : undefined} autoPlay muted />
      </div>
    </div>
  )
}

export default React.memo(Carplay)
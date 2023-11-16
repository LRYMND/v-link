/* eslint-disable no-case-declarations */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { RotatingLines } from 'react-loader-spinner'
import {
  findDevice,
  requestDevice,
  DongleConfig,
  CommandMapping,
} from 'node-carplay/web'
import { CarPlayWorker } from './worker/types'
import useCarplayAudio from './useCarplayAudio'
import { useCarplayTouch } from './useCarplayTouch'
import { InitEvent } from './worker/render/RenderEvents'

import "./../../styles.scss"
import "./../../themes.scss"
import './carplay.scss';

const videoChannel = new MessageChannel()
const micChannel = new MessageChannel()

function Carplay({ applicationSettings, phoneState, setPhoneState, carplayState, setCarplayState, view, setView }) {
  const RETRY_DELAY_MS = 30000

  const width = window.innerWidth
  const height = applicationSettings.interface.activateOSD.value ? window.innerHeight - applicationSettings.interface.heightOSD.value : window.innerHeight;

  const config: Partial<DongleConfig> = {
    width,
    height,
    fps: 60,
    mediaDelay: 300,
  }

  const [isPlugged, setIsPlugged] = useState(false)
  const [deviceFound, setDeviceFound] = useState<Boolean | null>(null)

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null,
  )

  useEffect(() => {
    console.log("Application.tsx: ", applicationSettings)
  }, []);

  const renderWorker = useMemo(() => {
    if (!canvasElement) return;

    const worker = new Worker(
      new URL('./worker/render/Render.worker.ts', import.meta.url), {
      type: 'module'
    }
    )
    const canvas = canvasElement.transferControlToOffscreen()
    // @ts-error
    worker.postMessage(new InitEvent(canvas, videoChannel.port2), [
      canvas,
      videoChannel.port2,
    ])
    return worker
  }, [canvasElement]);

  useLayoutEffect(() => {
    if (canvasRef.current) {
      setCanvasElement(canvasRef.current)
    }
  }, [])

  const carplayWorker = useMemo(() => {
    const worker = new Worker(
      new URL('./worker/CarPlay.worker.ts', import.meta.url), {
        type : 'module'
      }
    ) as CarPlayWorker
    const payload = {
      videoPort: videoChannel.port1,
      microphonePort: micChannel.port1,
    }
    worker.postMessage({ type: 'initialise', payload }, [
      videoChannel.port1,
      micChannel.port1,
    ])
    return worker
  }, [])

  const { processAudio, getAudioPlayer, startRecording, stopRecording } =
    useCarplayAudio(carplayWorker, micChannel.port2)
  
  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  // subscribe to worker messages
  useEffect(() => {
    carplayWorker.onmessage = ev => {
      const { type } = ev.data
      switch (type) {
        case 'plugged':
          setIsPlugged(true)
          setPhoneState(true)
          break
        case 'unplugged':
          setIsPlugged(false)
          setPhoneState(false)
          setCarplayState(false)
          break
        case 'requestBuffer':
          clearRetryTimeout()
          getAudioPlayer(ev.data.message)
          break
        case 'audio':
          clearRetryTimeout()
          processAudio(ev.data.message)
          break
        case 'media':
          //TODO: implement
          break
        case 'command':
          const {
            message: { value },
          } = ev.data
          switch (value) {
            case CommandMapping.startRecordAudio:
              startRecording()
              break
            case CommandMapping.stopRecordAudio:
              stopRecording()
              break
            case CommandMapping.requestHostUI:
              console.log("minimizing carplay")
              setView("Dashboard")
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
  }, [
    carplayWorker,
    clearRetryTimeout,
    getAudioPlayer,
    processAudio,
    renderWorker,
    startRecording,
    stopRecording,
  ])

  const checkDevice = useCallback(
    async (request: boolean = false) => {
      const device = request ? await requestDevice() : await findDevice()
      if (device) {
        setDeviceFound(true)
        const payload = {
          config,
        }
        carplayWorker.postMessage({ type: 'start', payload })
      } else {
        setDeviceFound(false)
      }
    },
    [carplayWorker],
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
        setDeviceFound(false)
      }
    }

    checkDevice()
  }, [carplayWorker, checkDevice])

  const onClick = useCallback(() => {
    checkDevice(true)
  }, [checkDevice])

  const sendTouchEvent = useCarplayTouch(carplayWorker, width, height)

  const isLoading = !isPlugged

  return (
    <div
      style={{ height: '100%', width: '100%', touchAction: 'none' }}
      id={'main'}
      className={`app ${applicationSettings.app.colorTheme.value}`}
    >
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: view === "Carplay" ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {deviceFound === false && (
            <>

              <button className="nav-button" style={{ color: 'var(--textColor)' }}>
                <h3>Connect or click to pair dongle.</h3>
                <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                  <use xlinkHref="/assets/svg/link.svg#link"></use>
                </svg>
              </button>
            </>
          )}
          {deviceFound === true && (
            <RotatingLines
              strokeColor="grey"
              strokeWidth="5"
              animationDuration="0.75"
              width="96"
              visible={true}
            />
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
          display: view === "Carplay" ? 'flex' : 'none',
          width: '100%',
          padding: 0,
          margin: 0,
          marginTop: applicationSettings.interface.activateOSD.value ? applicationSettings.interface.heightOSD.value : 0,
        }}
      >
        <canvas
          ref={canvasRef}
          id="video"
          style={
            isPlugged && view === "Carplay"
              ? { height: '100%' }
              : { display: 'none' }
          }
        />
      </div>
    </div>
  )
}

export default Carplay

import React, { useState, useEffect, useRef } from 'react';
import { GooSpinner } from 'react-spinners-kit';

import JMuxer from 'jmuxer';

import '@fontsource/montserrat';
import './carplay.scss';
import '../../components/themes.scss';



const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    minWidth: '80%',
    transform: 'translate(-50%, -50%)',
    overflow: 'scroll'
  }
};

function Carplay({
  ws,
  type,
  status,
  settings,
  touchEvent,
  streaming,
  setStreaming,
}) {
  const [height, setHeight] = useState(480);
  const [width, setWidth] = useState(800);
  const [mouseDown, setMouseDown] = useState(false);
  const [running, setRunning] = useState(false);
  //const [streaming, setStreaming] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    console.log('accessing carplay')
    let jmuxer = new JMuxer({
      node: 'player',
      mode: 'video',
      maxDelay: 30,
      fps: settings.fps,
      flushingTime: 100,
      debug: false
    });

    const height = ref.current.clientHeight;
    const width = ref.current.clientWidth;

    setHeight(height);
    setWidth(width);

    let videoElement;
    let playPromise;

    if (type === 'ws') {
      ws.onmessage = (event) => {
        if (event != null)
          setStreaming(true);
        if (!running) {
          videoElement = document.getElementById('player')
          if (videoElement != null) {
            playPromise = videoElement.play()
            if (playPromise !== undefined) {
              setRunning(true)
              playPromise.then(_ => {
              }).catch(error => {
              });
            }
          }
        }
        let buf = Buffer.from(event.data)
        let video = buf.slice(4)
        jmuxer.feed({ video: new Uint8Array(video) })
      }
    } else if (type === 'socket.io') {
      ws.on('carplay', (data) => {
        let buf = Buffer.from(data)
        let duration = buf.readInt32BE(0)
        let video = buf.slice(4)
        jmuxer.feed({ video: new Uint8Array(video), duration: duration })
      })
    }

    return function cleanup() {
      ws.onmessage = () => { }
    }
  }, [])


  const handleMDown = (e) => {
    let currentTargetRect = e.target.getBoundingClientRect();
    let x = e.clientX - currentTargetRect.left
    let y = e.clientY - currentTargetRect.top
    x = x / width
    y = y / height
    setLastX(x)
    setLastY(y)
    setMouseDown(true)

    touchEvent(14, x, y)
  }

  const handleMUp = (e) => {
    let currentTargetRect = e.target.getBoundingClientRect();
    let x = e.clientX - currentTargetRect.left
    let y = e.clientY - currentTargetRect.top
    x = x / width
    y = y / height
    setMouseDown(false)
    touchEvent(16, x, y)
  }

  const handleMMove = (e) => {
    let currentTargetRect = e.target.getBoundingClientRect();
    let x = e.clientX - currentTargetRect.left
    let y = e.clientY - currentTargetRect.top
    x = x / width
    y = y / height
    touchEvent(15, x, y)
  }

  const handleDown = (e) => {
    let currentTargetRect = e.target.getBoundingClientRect();
    let x = e.touches[0].clientX - currentTargetRect.left
    let y = e.touches[0].clientY - currentTargetRect.top
    x = x / width
    y = y / height
    setLastX(x)
    setLastY(y)
    setMouseDown(true)
    touchEvent(14, x, y)
    e.preventDefault()
  }

  const handleUp = (e) => {
    let x = lastX
    let y = lastY
    setMouseDown(false)
    touchEvent(16, x, y)
    e.preventDefault()
  }

  const handleMove = (e) => {
    let currentTargetRect = e.target.getBoundingClientRect();
    let x = e.touches[0].clientX - currentTargetRect.left
    let y = e.touches[0].clientY - currentTargetRect.top
    x = x / width
    y = y / height
    touchEvent(15, x, y)
  }

  return (
    <div className={`carplayApp ${settings.theme}`} style={{ height: '100%', width: '100%' }} id={'main'}>
      <div ref={ref}
        className='App'
        onTouchStart={handleDown}
        onTouchEnd={handleUp}
        onTouchMove={(e) => {
          if (mouseDown) {
            handleMove(e)
          }
        }}
        onMouseDown={handleMDown}
        onMouseUp={handleMUp}
        onMouseMove={(e) => {
          if (mouseDown) {
            handleMMove(e)
          }
        }}
        style={{ height: '100%', width: '100%', padding: 0, margin: 0, display: 'flex' }}>
        <video style={{ height: (streaming && status) ? '100%' : '0%' }} autoPlay muted id='player' />
        {status ? <div className='content'>
          <div>
            <GooSpinner size={60} color='var(--fillActive)' loading={true} />
          </div>
        </div> : <div className='content'>
          <div>
            <h1>WAITING FOR DEVICE</h1>
          </div>
        </div>
        }
      </div>
    </div>
  );
}

export default Carplay;

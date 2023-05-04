import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import { Loader } from '@react-three/drei'
import { Suspense } from 'react'

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
    <>
    <Canvas
        shadows
        camera={ {
            fov: 50,
            near: 0.1,
            far: 100,
            position: [ 100,100,100 ]
        } }
        pixelRatio={ Math.min(2, window.devicePixelRatio)}

    >
        <color args={[ 0,0,0 ]} attach="background" />
        <Suspense>
            <Experience />
        </Suspense>
    </Canvas>
    <Loader/>
    </>
)
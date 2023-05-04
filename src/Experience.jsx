import { CubeCamera, Environment, MeshReflectorMaterial, OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
import { LinearEncoding, RepeatWrapping, sRGBEncoding, TextureLoader, Mesh, Color } from 'three'
import React, { useEffect } from 'react'
import { useRef } from 'react'
import { Bloom, ChromaticAberration, DepthOfField, EffectComposer } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useControls } from 'leva'
import { useState } from 'react'
import * as THREE from 'three'

export function Ground({ Speed, Leva })
{
    const [ roughness, normal ] = useLoader(TextureLoader, [
        "./textures/terrain-roughness.jpg",
        "./textures/terrain-normal.jpg"
    ])


    let [ resolution, setresolution ] = useState(1024)

    useEffect(() =>
    {
        [normal, roughness].forEach((state) =>
        {
            state.wrapS = RepeatWrapping;
            state.wrapT = RepeatWrapping;
            state.repeat.set(15,15);
        })

        normal.encoding = LinearEncoding;
    },[normal, roughness])

    useFrame((state, delta) =>
    {
        let t = -state.clock.elapsedTime*(0.390)*Speed
        roughness.offset.set(0,t)
        normal.offset.set(0,t)
        if(Leva.Enabled)
        {
            setresolution(1024)
        }else
        {
            setresolution(0)
        }
    })




    return <>
        <mesh rotation-x={ -Math.PI/2 } castShadow receiveShadow >
            <planeGeometry args={[30,30]}/>
            <MeshReflectorMaterial 
                envMapIntensity={Leva.envMapIntensity}
                dithering={true}
                roughnessMap={roughness}
                normalMap={normal}
                displacementScale={0.1}
                roughness={Leva.roughness}
                color={[0.015, 0.015, 0.015]}
                blur={[Leva.blur, 400]} 
                mixBlur={Leva.mixBlur} 
                mixStrength={Leva.mixStrength} 
                mixContrast={Leva.mixContrast} 
                resolution={resolution} 
                mirror={Leva.mirror} 
                depthScale={Leva.depthScale} 
                minDepthThreshold={Leva.minDepthThreshold} 
                maxDepthThreshold={Leva.maxDepthThreshold} 
                depthToBlurRatioBias={Leva.depthToBlurRatioBias} 
                debug={0}
                reflectorOffset={0.2}
            />
        </mesh>
    </>
}

export function Car({ Speed })
{
    const gltf = useGLTF("./models/car/scene.gltf")

    useEffect(() =>
    {
        gltf.scene.scale.set(0.005,0.005,0.005)
        gltf.scene.position.set(0,-0.035,0)
        gltf.scene.traverse((object) =>
        {
            if(object instanceof Mesh)
            {
                object.castShadow = true
                object.receiveShadow = true
                object.material.envMapIntensity = 20
            }
        })
    }, [gltf])

    useFrame((state) =>
    {
        const time = state.clock.elapsedTime * Speed

        let group = gltf.scene.children[0].children[0].children[0]
        group.children[0].rotation.x = time * 2
        group.children[2].rotation.x = time * 2
        group.children[4].rotation.x = time * 2
        group.children[6].rotation.x = time * 2
    })


    return <>
        <primitive object={gltf.scene} />
    </>
}

export function Rings({ Speed, Color1, Color2 })
{
    const itemsRef = useRef([])

    useFrame(( state ) =>
    {
        
        const time = state.clock.elapsedTime * Speed

        for(let i = 0; i < itemsRef.current.length; i++)
        {
            let mesh = itemsRef.current[i]


            let z = (i-7)*3.5 + ((time*0.4)%3.5)*2
            mesh.position.set(0,0,-z)

            let dist = Math.abs(z)
            mesh.scale.set( 1-dist*0.04,1-dist*0.04,1-dist*0.04 )

            let colorScale = 1
            if (dist > 2)
            {
                colorScale = 1 - (Math.min(dist,12) -2)/10
            }
            colorScale *= 0.5

            if( i%2 == 1 )
            {
                mesh.material.emissive = new Color(Color1).multiplyScalar(colorScale)
            }else 
            {
                mesh.material.emissive = new Color(Color2).multiplyScalar(colorScale)
            }
        }
    })

    return <>
        {...Array(14).fill(null).map((v,i) =>
        {
            return <> 
                <mesh
                    castShadow
                    receiveShadow
                    position={[ 0,0,0 ]}
                    key={i}
                    ref={(el) => (itemsRef.current[i] = el) }
                >
                    <torusGeometry args={[ 3.35, 0.05, 16, 100 ]} />
                    <meshStandardMaterial emissive={[ 0.5,0.5,0.5 ]} color={[ 0,0,0 ]} />
                </mesh>
            </>
        })}
    </>
}

export default function Experience()
{
    // smoothedCameraPosition.lerp( cameraPosition, 5*delta )
    // smoothedCameraTarget.lerp( cameraTarget, 5*delta )

    // state.camera.position.copy(smoothedCameraPosition)
    // state.camera.lookAt(smoothedCameraTarget)
    const [ StartWeb, useStartWeb ] = useState(0)
    const [lightColor, setLightColor] = useState("#ffffff");
    const [Ring1, setRing1] = useState("#ffffff");
    const [Ring2, setRing2] = useState("#ffffff");

    const [ cameraPositionS ] = useState( () => new THREE.Vector3(100,100,100) )
    const [ cameraPositionE ] = useState( () => new THREE.Vector3(3,2,5) )


    let [FirstRender,useFirstRender] = useState(true)
    useFrame((state, delta) => 
    {   
        if(FirstRender)
        {
            useStartWeb(state.clock.elapsedTime)
            useFirstRender(false)
        }
        if(  state.clock.elapsedTime < (3 + StartWeb) ){
            cameraPositionS.lerp( cameraPositionE, 0.05 )
            state.camera.position.copy(cameraPositionS)
        } else if ( (3+StartWeb) < state.clock.elapsedTime && state.clock.elapsedTime < (3.3+StartWeb) ){
            state.camera.position.copy(cameraPositionE)
        }
    })

    const SpeedCar = useControls(' Car ',{
        Speed : { value: 1, min:0, max:25, step:0.001 },
        colorSpot : { value: '#ffffff'}
    }, { collapsed : true })

    const Ring = useControls(' Ring ',{
        ColorRing1 : { value: '#ffffff'},
        ColorRing2 : { value: '#ffffff'}
    }, { collapsed : true })

    const {AutoRotate} = useControls(' Camera ',{
        AutoRotate : { value: true},
    }, { collapsed : true })

    const Floor = useControls(' Ground reflector ', {
        Enabled : true,
        envMapIntensity : { value : 0, min:0,max:1},
        roughness : { value : 0.7, min:0,max:1},
        blur : { value : 1000, min:0,max:1000},
        mixBlur : { value : 30, min:0,max:30},
        mixStrength : { value : 80, min:0,max:100},
        mixContrast : { value : 1, min:0,max:1},
        mirror : { value : 0, min:0,max:1},
        depthScale : { value : 0.01, min:0,max:1},
        minDepthThreshold : { value : 0.9, min:0,max:1},
        maxDepthThreshold : { value : 1, min:0,max:1},
        depthToBlurRatioBias : { value : 0.25, min:0,max:1}
    }, { collapsed : true })

    const Aberration = useControls(' Aberation Chromatique ',{
        Aberration : true,
        offset: { value: 0, min:-0.02,max:0.02, step:0.0001 }
    }, { collapsed : true })


    const bloom = useControls(' Bloom ',{
        bloom : { value : true},
        luminanceSmoothing : { value : 0.025, min:0,max:1},
        luminanceThreshold : { value : 0.85, min:0,max:1},
        intensity : { value : 1.3, min:0,max:10}
    }, { collapsed : true })


    const depthOfField = useControls(' Depth Of Field ',{
        depthOfField : true,
        focusDistance : { value : 0.0035, min:0,max:1},
        focalLength : { value : 0.1, min:0,max:1},
        bokehScale : { value : 2, min:0,max:10}
    }, { collapsed : true })
    

    useEffect(() => {
        setLightColor(SpeedCar.colorSpot)
    }, [SpeedCar.colorSpot])

    useEffect(() => {
        setRing1(Ring.ColorRing1)
    }, [Ring.ColorRing1])

    useEffect(() => {
        setRing2(Ring.ColorRing2)
    }, [Ring.ColorRing2])

    return <>



        <OrbitControls target={[ 0,0.35,0 ]} maxPolarAngle={ 1.45 }   autoRotate={AutoRotate}  
        />


        <spotLight
            color={lightColor}
            intensity={ 1.5 }
            angle={0.6}
            penumbra={0.5}
            position={[ 5,5,0 ]}
            castShadow
            shadow-bias={-0.0001}
        />

        <spotLight
            color={lightColor}
            intensity={ 2 }
            angle={0.6}
            penumbra={0.5}
            position={[ -5,5,0 ]}
            castShadow
            shadow-bias={-0.0001}
        />

        <Ground Speed={SpeedCar.Speed} Leva={Floor} />

        <CubeCamera resolution={256} frames={Infinity} >
            {(texture) => {
                return <>
                    <Environment map={texture} />
                    <Car Speed={SpeedCar.Speed} />
                </>
            }}
        </CubeCamera>
        <Rings Speed={SpeedCar.Speed} Color1={Ring.ColorRing1} Color2={Ring.ColorRing2} />

        <EffectComposer>
            {depthOfField.depthOfField && <DepthOfField 
                focusDistance={depthOfField.focusDistance}
                focalLength={depthOfField.focalLength}
                bokehScale={depthOfField.bokehScale}
                height={480}
            />}
            {bloom.bloom && (
                <Bloom
                    blendFunction={BlendFunction.ADD}
                    intensity={bloom.intensity}
                    width={300}
                    height={300}
                    kernelSize={5}
                    luminanceThreshold={bloom.luminanceThreshold}
                    luminanceSmoothing={bloom.luminanceSmoothing}
                />
            )}
            {Aberration.Aberration && <ChromaticAberration
            offset={[ Aberration.offset, 0.002 ]}
            />}
        </EffectComposer>

    </>
}
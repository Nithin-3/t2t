import React, {useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import {Peer} from 'peerjs'
import axi from 'axios'
import { useNavigate } from 'react-router-dom'
export default function Talk() {

    const ithu = useRef()
    const aathu = useRef()
    const [txt,txted] = useState('')
    const nav = useNavigate()
    useEffect(()=>{
            document.getElementById('nxt').addEventListener('click',()=>{window.location.reload()})
        const sock = io('http://192.168.117.146:1010/')
        const per = new Peer(undefined,{host:'192.168.117.146',port:301,path:'/'})
        const reload = (id)=>{
            let idd = window.location.hash.replace('#','') 
            axi.get(`http://192.168.117.146:1010/${idd}`,{responseType:'text'}).then(t=>{
                console.log(t.data)
                t.data && sock.emit("who",idd,t.data,id)

            }).catch(e=>{
                    // console.log(e.response)
                    if (e.response.data==='user not found'&&e.response.status === 404) {
                        nav('/')
                    }
                })
        }
        per.on('open',id=>{
            // console.log(id)
            reload(id)
            sock.on("new",()=>{
                reload(id) 
            })
        })
        const fall= (strm)=>{
            ithu.current.muted = true
            ithu.current.srcObject = strm
            ithu.current.addEventListener('loadedmetadata',()=>{ithu.current.play()})
            sock.on("begin",id=>{
                const call = per.call(id,strm)
                call.on('stream',show)
            })
            per.on('call',cl=>{
                cl.answer(strm)
                cl.on('stream',show)
            })
            per.on('close',()=>{
                console.log("peer closed!....")
                aathu.current.srcObject = null
            })
        }
        const MEDIA =  navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        navigator.mediaDevices?.getUserMedia({video:true,audio:true,}).then(fall)
        navigator.mediaDevices ?? MEDIA?.({video:true,audio:true,},fall)
        MEDIA ?? console.log("HTTP")
    },[nav])
    const show=(strm)=>{
        aathu.current.srcObject = strm
        aathu.current.addEventListener('loadedmetadata',()=>{
            aathu.current.play()
        })
    }

    return (
        <div className='ok'>
            <video ref={ithu} ></video>
            <video ref={aathu}></video>
            <div className='low1'>
                <textarea type='text' value={txt} onChange={e=>txted(e.target.value)}/>
            </div>
            <div className='low2' >
                <span className='banner'></span>
                <button id='nxt'>next</button>

            </div>

        </div>
    )
}

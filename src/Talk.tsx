import React, {useEffect, useRef, } from 'react'
import io from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
export const  Talk: React.FC = () => {
    const nav = useNavigate();
    const locVid = useRef<HTMLVideoElement>(null);
    const remVid = useRef<HTMLVideoElement>(null);
    const stream = useRef<MediaStream>(null);
    const peer = useRef<RTCPeerConnection | null>(null);
    useEffect(()=>{
        const id = sessionStorage.getItem('id')
        if (!id) {
            nav('/');
            return;
        }
        const sock = io("http://192.168.80.147:1010/")
        sock.emit('set',id)
        const find = (fetc = true)=>{
            if (peer.current) {
                peer.current.onicecandidate = null;
                peer.current.ontrack = null;
                peer.current.close();
                peer.current = null;
            }
            peer.current = new RTCPeerConnection({iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]});
            if (stream.current) {
                stream.current.getTracks().forEach(track => peer.current?.addTrack(track, stream.current!));
            }
            peer.current.onicecandidate = (e)=>{
                if(e.candidate) sock.emit("ice", sessionStorage.getItem('roomMate') ,e.candidate);
            }
            peer.current.ontrack = (e)=>{
                remVid.current!.srcObject = e.streams[0];
            }
            peer.current.onconnectionstatechange = () => {
                const state = peer.current?.connectionState;
                if (state === "disconnected" || state === "failed" || state === "closed") {
                    sock.emit("exit", id);
                    // reset UI or auto-reconnect
                }
            };

            fetc &&
            fetch("http://192.168.80.147:1010/",{headers:{id}}).then(t=>t.text()).then(t=>{
                sessionStorage.setItem('roomMate',t)
                t && 
                peer.current!.createOffer().then(offer=>{
                    peer.current!.setLocalDescription(offer);
                    stream.current?.getTracks().forEach(track => peer.current?.addTrack(track, stream.current!));
                    sock.emit("offer", t, offer);
                });
            })
        }
        sock.on('offer', async (roomMate, offer) => {
            find(false)
            setTimeout(async () => {
                await peer.current!.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peer.current!.createAnswer();
                await peer.current!.setLocalDescription(answer);
                sock.emit('answer', roomMate, answer);
            }, 100);        });
        sock.on('answer', async (answer) => {
            await peer.current!.setRemoteDescription(new RTCSessionDescription(answer));
        });
        sock.on('ice', async (candidate) => {
            try {
                await peer.current!.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error('Error adding ICE candidate', e);
            }
        });
        const setstrm = (strm: MediaStream)=>{
            stream.current = strm;
            locVid.current!.muted = true;
            locVid.current!.srcObject = strm;
            strm.getTracks().forEach(track => peer.current?.addTrack(track, strm));
        } 
        navigator.mediaDevices?.getUserMedia({video:true,audio:true,}).then(setstrm)
        find()
        return ()=>{
            stream.current?.getTracks().forEach(t=>t.stop());
            stream.current = null
            if (locVid.current) {
                locVid.current.srcObject = null;
                locVid.current = null;
            }
            if (peer.current) {
                peer.current.close();
                peer.current = null;
            }
            sock.disconnect()
        }
    },[])
    return (
        <div className='ok'>
            <video ref={locVid} autoPlay style={{transform:"scaleX(-1)"}}></video>
            <video ref={remVid} autoPlay></video>
            <div className='low1'>
                <textarea />
            </div>
            <div className='low2' >
                <span className='banner'></span>
                <button id='nxt'>next</button>
            </div>
        </div>
    )
}

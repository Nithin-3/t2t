import React, {useEffect, useRef, useState,} from 'react'
import io, { Socket } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
export const Talk: React.FC = () => {
    const nav = useNavigate();
    const locVid = useRef<HTMLVideoElement>(null);
    const remVid = useRef<HTMLVideoElement>(null);
    const stream = useRef<MediaStream>(null);
    const peer = useRef<RTCPeerConnection | null>(null);
    const sock = useRef<Socket>(null);
    const [txt,stxt] = useState('');
    const [locLoaded, setLocLoaded] = useState(false);
const [remLoaded, setRemLoaded] = useState(false);

    useEffect(() => {
        const id = sessionStorage.getItem('id');
        if (!id) {
            nav('/');
            return;
        }
        const setstrm = (strm: MediaStream) => {
            stream.current = strm;
            locVid.current!.srcObject = strm;
            strm.getTracks().forEach(track => peer.current?.addTrack(track, strm));
            setLocLoaded(true);
        }
        navigator.mediaDevices?.getUserMedia({video: true, audio: true}).then(setstrm).then(()=>find())
        sock.current = io("http://192.168.80.147:1010/");
        sock.current.emit('set', id);

        sock.current.on('offer', async (roomMate, offer) => {
            find(false)
            sessionStorage.setItem("roomMate",roomMate)
            setTimeout(async () => {
                await peer.current!.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peer.current!.createAnswer();
                await peer.current!.setLocalDescription(answer);
                sock.current!.emit('answer', roomMate, answer);
            }, 100);
        });
        sock.current.on('answer', async (answer) => {
            await peer.current!.setRemoteDescription(new RTCSessionDescription(answer));
        });
        sock.current.on('ice', async (candidate) => {
            try {
                await peer.current!.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error('Error adding ICE candidate', e);
            }
        });

        sock.current.on('msg',msg=>{
            msgC(msg)
        });
        return () => {
            stream.current?.getTracks().forEach(t => t.stop());
            stream.current = null;
            if (locVid.current) locVid.current.srcObject = null;
            if (peer.current) {
                peer.current.close();
                peer.current = null;
            }
            if (sock.current) {
                sock.current.off('offer');
                sock.current.off('answer');
                sock.current.off('ice');
                sock.current.off('msg');
                sock.current.disconnect();
            }
        }
    }, [])

    const find = (fetc = true) => {
        const msgContainer = document.getElementById('msg');
        if (msgContainer) {
            msgContainer.innerHTML = '';
        }
        if (peer.current) {
            peer.current.onicecandidate = null;
            peer.current.ontrack = null;
            peer.current.close();
            peer.current = null;
        }
        peer.current = new RTCPeerConnection({iceServers: [{ urls: "stun:stun1.l.google.com:19302" },{ urls: "stun:stun2.l.google.com:19302" }]});
        if (stream.current) {
            stream.current.getTracks().forEach(track => peer.current?.addTrack(track, stream.current!));
        }
        peer.current.onicecandidate = (e) => {
            if (e.candidate) sock.current!.emit("ice", sessionStorage.getItem('roomMate'), e.candidate);
        }
        peer.current.ontrack = (e) => {
            remVid.current!.srcObject = e.streams[0];
            setRemLoaded(true);
        }
        peer.current.onconnectionstatechange = () => {
            const state = peer.current?.connectionState;
            if (state === "disconnected" || state === "failed" || state === "closed") {
                sock.current!.emit("exit", sessionStorage.getItem('id')!);
                setRemLoaded(false);
            }
        };
        fetc && fetch("http://192.168.80.147:1010/", {headers: {id: sessionStorage.getItem('id')! }}).then(t => t.text()).then(t => {
            if (t) {
                console.log("roomMate",t)
                sessionStorage.setItem('roomMate', t)
                peer.current!.createOffer().then(offer => {
                    peer.current!.setLocalDescription(offer);
                    sock.current!.emit("offer", t, offer);
                });
            }
        })
    }
    const msgC = (txt: string, right = false) => {
        const div = document.createElement('div');
        const p = document.createElement('p');

        p.textContent = txt;

        div.style.display = 'flex';
        div.style.justifyContent = right ? 'flex-end' : 'flex-start';
        div.appendChild(p);

        const msgContainer = document.getElementById('msg');
        if (msgContainer) {
            msgContainer.appendChild(div);

            msgContainer.scrollTop = msgContainer.scrollHeight;
        }
    };
    const send = ()=>{
        if(!txt.trim()) return;
        sock.current!.emit('msg',sessionStorage.getItem('roomMate'),txt.trim());
        msgC(txt.trim(),true)
        stxt('');

    }
    return (
        <>
            <div className='video-chat'>
                <div style={{ position: "relative" }}>
                    <video ref={locVid} autoPlay muted style={{ transform: "scaleX(-1)" }} />
                    {locLoaded || (
                        <img
                            src="./t2t-load.gif"
                            alt="Loading local video"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(0,0,0,0.2)'
                            }}
                        />
                    )}
                </div>
                <div style={{ position: "relative" }}>
                    <video ref={remVid} autoPlay />
                    {remLoaded || (
                        <img
                            src="./t2t-load.gif"
                            alt="Loading remote video"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(0,0,0,0.2)'
                            }}
                        />
                    )}
                </div>
            </div>
            <div className="root-event">
                <div>
                    <div id='msg'>
                    </div>
                    <div>
                        <input type="text" placeholder="Type..." value={txt} onChange={e=>stxt(e.target.value)} />
                        <button type="button" onClick={send}>Send</button>
                    </div>
                </div>
                <button type="button" onClick={()=>find()}>Find</button>
            </div>
        </>
    )
}


import React,{useRef, useState} from 'react'
import './log.css'
import axios from 'axios'
import { useNavigate, } from 'react-router-dom'
export const LOg = () => {
    const nav = useNavigate()
    const name=useRef(null);
    const [age,setage]=useState('0');
    const gen = useRef(null);
    const geen = useRef(null);


    const submit=(e)=>{
        e.preventDefault();
        if (name.current.value && age && (gen.current.checked || geen.current.checked)) {
            axios.post("http://192.168.117.146:1010/",{name:name.current.value,age:age,gen:gen.current.checked}).then(response => {
                nav("/talk#"+response.data)
              })
            
        }else{
            alert('fill missing fields')
        }
    }
    
  return (
    <div className='loinpg'>
        <div className='inn'>
            <form onSubmit={submit}>
            <h2 >Get in as ~T2T~ </h2>
                <input id='nam' className='inpu' placeholder='name...' ref={name}/><br/>
                <select value={age} onChange={e=>setage(e.target.value)} id='ag' className='inpu'>
                    <option value='0'>age</option>
                    <option value='15-20'>15-20</option>
                    <option value='21-26'>21-26</option>
                    <option value='27-33'>27-33</option>
                    <option value='exper'>Experied</option>

                </select><br/>
                <input id='ma' name='gen' type='radio' className='inpur' ref={gen}/><label htmlFor='ma'>male</label>&nbsp;&nbsp;&nbsp;
                <input id='fe' name='gen' type='radio' className='inpur' ref={geen}/><label htmlFor='fe'>female</label><br/>
                <input type='button' className='button-50' onClick={submit} value='connect'/>

            </form>
        </div>
    </div>
  )
}

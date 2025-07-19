import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

export const Log: React.FC = () => {
    const nav = useNavigate();
    const name = useRef<HTMLInputElement>(null);
    const [age, setage] = useState<'0' | '15-20' | '21-26' | '27-33' | 'exper'>('0');
    const gen = useRef<HTMLInputElement>(null);
    const geen = useRef<HTMLInputElement>(null);
    const [country, scountry] = useState('global');
    const [countrys, scountrys] = useState<any[]>([]);

    useEffect(() => {
         fetch('https://t2t-ser.onrender.com/country').then(res => res.json()).then(r=>{
            scountry(r.country	|| 'global')
        }).catch()
        fetch('https://restcountries.com/v3.1/all?fields=name,cca2').then(r => r.json()).then(data => {
            const sorted = data.sort((a: any, b: any) => a.name.common.localeCompare(b.name.common));
            const opts = [
                { value: 'global', label: '🌐 Global' },
                ...sorted.map((v: any) => ({
                    value: v.name.common,
                    label: `${getEmojiFlag(v.cca2)} ${v.name.common} (${v.name.official})`
                }))
            ];
            scountrys(opts);
        });
    }, []);

    const getEmojiFlag = (code: string): string => code.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt(0) + 127397));

    const submit = (e: React.MouseEvent<HTMLInputElement, MouseEvent> | React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (name.current!.value && age && (gen.current!.checked || geen.current!.checked)) {
            fetch("https://t2t-ser.onrender.com/",{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({
                    name: name.current!.value,
                    age,
                    mechanic:gen.current!.checked,
                    country,
                })
            }).then(async t=>sessionStorage.setItem('id',await t.text())).then(()=>nav('/talk'))
        } else {
            alert('fill missing fields');
        }
    };

    return (
        <div className='loinpg'>
            <form onSubmit={submit} className="inn">
                <h2>Get in as ~T2T~ </h2>
                <input id='nam' className='inpu' placeholder='name...' ref={name} />
                <select value={age} onChange={e => setage(e.target.value as any)} id='ag' className='inpu'>
                    <option value='0'>age</option>
                    <option value='15-20'>15-20</option>
                    <option value='21-26'>21-26</option>
                    <option value='27-33'>27-33</option>
                    <option value='exper'>Experied</option>
                </select>
                <div>
                    <input id='ma' name='gen' type='radio' className='inpur' ref={gen} /><label htmlFor='ma'>male</label>&nbsp;&nbsp;&nbsp;
                    <input id='fe' name='gen' type='radio' className='inpur' ref={geen} /><label htmlFor='fe'>female</label><br />
                </div>
                <Select options={countrys} value={countrys.find(opt => opt.value === country)} onChange={(e: any) => scountry(e.value)} placeholder="Select country" className='inpu-s'
                    styles={{
                        control: (base) => ({
                            ...base,
                            background: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            minHeight: 'auto',
                            padding: 0,
                            margin:0,
                        }),
                        indicatorsContainer: () => ({ display: 'none' }), // removes dropdown arrow
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? '#eee' : '#fff',
                            color: '#000',
                            textAlign:'left',
                            padding: '12px 16px',
                            cursor: 'pointer',
                        }),
                    }}/>
                <input type='button' className='button-50' onClick={submit} value='connect' />
            </form>
        </div>
    );
};


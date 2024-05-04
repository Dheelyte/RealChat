import React, { useEffect, useState } from 'react';
import { ReactComponent as SettingsSvgIcon} from '../../images/settings.svg'
// import Picker from '@emoji-mart/react'
import { useParams } from 'react-router-dom';
import { ReactComponent as MicrophoneSvgIcon} from '../../images/microphone.svg'
import { ReactComponent as VolumeSvgIcon} from '../../images/volume-mute.svg'
import { ReactComponent as HangUpSvgIcon} from '../../images/hangup.svg'
import { ReactComponent as UserSvgIcon} from '../../images/user.svg'
import { ReactComponent as MoonSvgIcon} from '../../images/moon.svg'
import { ReactComponent as SunSvgIcon} from '../../images/sun.svg'
import { ReactComponent as RecordSvgIcon} from '../../images/dot-circle.svg'


const CallerPage = ({changeMode, toggleMode}) => {
    const [seconds, setSeconds] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [hours, setHours] = useState(0);
    const [isPickerVisible, setPickerVisible] = useState(false);
    // const [callersPage, setisCallerPage] = useState('');
    const params = useParams()
    // set the image
    const [image, setImage] = useState(SunSvgIcon)
   
    // we have to create what connects the css to this code 

    // const themeClass = changeMode ? "light"  : " dark"

const changeImage = () => {
    setImage(prevImage => prevImage === SunSvgIcon ? MoonSvgIcon : SunSvgIcon);
};




    // Create a timer
    let timer;

    useEffect(() => {
        timer = setInterval(() => {
            setSeconds(seconds + 1);

            if (seconds === 59) {
                setMinutes(minutes + 1);
                setSeconds(0);
                if (minutes === 59) {
                    setHours(hours + 1);
                    setMinutes(0);
                }
            }
        }, 1000);

        // Clean up function
        return () => clearInterval(timer);
    });

    // const togglePicker = () => {
    //     setPickerVisible(!isPickerVisible);
    // };

    return (
        // access to the new info
       <div className={`caller-page ${changeMode ? 'light' : 'dark'}`}>
         
         <div className="top">
            
         <div className='top--1'>
            {/* i choose not to use it but you can test it */}
         {/* <RecordSvgIcon/> */}
                <h1 className='timer'> {hours < 10 ? "0" + hours : hours} : {minutes < 10 ? "0" + minutes : minutes} : {seconds < 10 ? "0" + seconds : seconds}</h1>
            </div>

          
                {/* <img src={SunSvgIcon} alt='sun' className='sun' onClick={() => { changeImage(); toggleMode(); }} /> */}
               {/* <SunSvgIcon className='top--2'  onClick={() => { changeImage(); toggleMode(); }}/> */}
               <div onClick={() => { changeImage(); toggleMode(); }}>
                    {changeMode ? <MoonSvgIcon  className='top--2' /> : <SunSvgIcon  className='top--2'/>}
                </div>
              
         </div>
     
           
           <div className="caller--name">
                <h1> Caller</h1>
            </div>
           
              
                 <div className='end'>

                 <div className='1st--space'>
                  <MicrophoneSvgIcon  className='end--1'/>
                  </div>
                  

                 
                  <VolumeSvgIcon className='end--2'/>
                  <HangUpSvgIcon className='end--2'/>
                  

                 
                    <SettingsSvgIcon className='end--3'/>
                   <UserSvgIcon className='end--3'/>
                   
                   
                 </div>

        </div>
    );
}

export default CallerPage;


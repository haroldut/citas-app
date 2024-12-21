'use client';
import {useEffect, useState} from 'react';
import {redirect} from 'next/navigation';
import axios from "axios";
import dayjs from 'dayjs';


export default function Appointments() {
  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [token, setToken] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [creationSuccessful, setCreationSuccessful] = useState(false);
  const [errorTimeReserved, setErrorTimeReserved] = useState(false);
  const [currentDate, setCurrentDate] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setToken(window.localStorage.getItem('token'));
    setCurrentDate(dayjs());
  }, []); 

  useEffect(() => {
    if(token != null) {
      axios.get('http://localhost/api/user', {
        headers: {
          'Authorization': 'Bearer '+token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(function() {
        setIsValidated(true);
      })
      .catch(function () {
        redirect(`/`);
      });
    }
  }, [token]);

  useEffect(() => {
    if(isValidated) {
      fetchAppointments();
    }
  }, [isValidated, currentDate]);
  
  const fetchAppointments = () => {
    axios.get('http://localhost/api/appointments?start_date='+currentDate.format('YYYY-MM-DD') , {
      headers: {
        'Authorization': 'Bearer '+token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(function (response) {
      setDates(response.data.dates);
      setTimes(response.data.times);
      setAppointments(response.data.appointments);
    })
    .catch(function () {
      console.log('Error loading appointments');
    });
  }

  const scheduleAppointment = async (dateWithTime) => {
    axios.post('http://localhost/api/appointments',
     {dateWithTime},
     {
      headers: {
        'Authorization': 'Bearer '+token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(function () {
      fetchAppointments();

      setErrorTimeReserved(false);
      setCreationSuccessful(true);

      setTimeout(() => {
        setCreationSuccessful(false);
      }, 5000);
    })
    .catch(function (err) {      
      setErrorMessage(err.response.data.error ?? 'Your appointment could not been scheduled because the date and time can not be before the current date and time or the time is already reserved, please select other time.');
      setCreationSuccessful(false);
      setErrorTimeReserved(true);

      setTimeout(() => {
        setErrorTimeReserved(false);
      }, 5000);
    });
  }

  const getAppointmentClasses = (dateWithTime) => {
    const dateWithAppointmentsReserved = appointments.filter((appointment) => appointment.date_with_time === dateWithTime && appointment.status === 'Reserved');
    if(dateWithAppointmentsReserved.length > 0)
      return 'bg-gray-300';

    return 'bg-gray-50 cursor-pointer';
  }

  const logOut = () => {
    localStorage.removeItem("token");
    redirect('/')
  }

  return (
    <>
      <div className="flex justify-center m-3">
        <div className="flex gap-x-2 w-9/12">
          <button
            type="button"
            className="inline-block rounded bg-blue-300 px-2 pb-2 pt-2 text-xs font-medium uppercase leading-normal text-black shadow-primary-3"
            onClick={() => redirect('/dashboard')}>
            Go To Dashboard
          </button>
        
          <button
            type="button"
            className="inline-block rounded bg-green-300 px-2 pb-2 pt-2 text-xs font-medium uppercase leading-normal text-black shadow-primary-3"
            onClick={() => setCurrentDate(currentDate.subtract(7, 'day'))}>
            Previous Week
          </button>
        
          <button
            type="button"
            className="inline-block rounded bg-green-300 px-2 pb-2 pt-2 text-xs font-medium uppercase leading-normal text-black shadow-primary-3"
            onClick={() => setCurrentDate(currentDate.add(7, 'day'))}>
            Next Week
          </button>

          <button
            type="button"
            className="inline-block rounded bg-gray-300 px-2 pb-2 pt-2 text-xs font-medium uppercase leading-normal text-black shadow-primary-3"
            onClick={() => logOut()}>
            Log Out
          </button>
        </div>
      </div>
      <div className="flex justify-center m-3">
        <table
          className="w-9/12 text-left text-sm font-light text-surface">
          <thead
            className="border-b border-neutral-200 bg-white font-medium">
            <tr key='tr_head'>
              {dates.map((date) => {
                return <th key={`th_date_${date}`} scope="col" className="px-6 py-2">{date}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => {
              return <tr
                key={`th_date_${time.replace(':', '')}`}
                className="border-b border-neutral-200">
                {dates.map((date) => {
                  return <td key={`tr_date_with_time_${date}_${time.replace(':', '')}`} onClick={() => scheduleAppointment(`${date} ${time}`)} className={'whitespace-nowrap px-6 py-2 ' + getAppointmentClasses(`${date} ${time}`)}>{time.slice(0, -3)}</td>;
                })}
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      {errorTimeReserved && <div className="flex justify-center m-3">
        <div className="w-9/12 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p>{errorMessage}</p>
        </div>
      </div>}
      {creationSuccessful && <div className="flex justify-center m-3">
        <div className="w-9/12 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
          <p>Your appointment was successfully created and your time is reserved, you can schedule a new appointment or get back to dashboard.</p>
        </div>
      </div>}
      </>
  );
}
'use client';
import {useEffect, useState} from 'react';
import {redirect} from 'next/navigation';
import axios from "axios";


export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [token, setToken] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [cancelSuccessful, setCancelSuccessful] = useState(false);
  const [cancelError, setCancelError] = useState(false);

  useEffect(() => {
    setToken(window.localStorage.getItem('token'));
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
  }, [isValidated]);
  
  const fetchAppointments = () => {
    axios.get('http://localhost/api/appointments?only_current_user=1', {
      headers: {
        'Authorization': 'Bearer '+token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(function (response) {
      setAppointments(response.data.appointments);
    })
    .catch(function () {
      console.log('Error loading appointments');
    });
  }

  const cancelAppointment = async (appointment) => {
    axios.delete('http://localhost/api/appointments/'+appointment.id,
     {
      headers: {
        'Authorization': 'Bearer '+token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(function () {
      fetchAppointments();

      setCancelSuccessful(true);

      setTimeout(() => {
        setCancelSuccessful(false);
      }, 5000);
    })
    .catch(function () {
      setCancelError(true);

      setTimeout(() => {
        setCancelError(false);
      }, 5000);
    });
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
            onClick={() => redirect('/appointments')}>
            Create a New Appointment
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
            <tr>
              <th scope="col" className="px-6 py-2">Date</th>
              <th scope="col" className="px-6 py-2">Status</th>
              <th scope="col" className="px-6 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => {
              return <tr key={`appointment_${appointment.id}`} className="border-b border-neutral-200">
                <td className={'whitespace-nowrap px-6 py-2'}>{appointment.date_with_time}</td>
                <td className={'whitespace-nowrap px-6 py-2'}>{appointment.status}</td>
                <td className={'whitespace-nowrap px-6 py-2'}>
                  {appointment.status === 'Reserved' && <button
                    type="button"
                    className="inline-block rounded bg-red-300 px-0.5 pb-0.5 pt-0.5 text-xs font-medium uppercase leading-normal text-black shadow-primary-3"
                    onClick={() => cancelAppointment(appointment)}>
                    Cancel
                  </button>}
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      {cancelSuccessful && <div className="flex justify-center m-3">
        <div className="w-9/12 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
          <p>Your appointment was successfully canceled.</p>
        </div>
      </div>}
      {cancelError && <div className="flex justify-center m-3">
        <div className="w-9/12 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p>Your appointment could not been canceled</p>
        </div>
      </div>}
    </>
  );
}
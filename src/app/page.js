'use client';
import {useEffect, useState} from 'react';
import {redirect} from 'next/navigation';
import axios from "axios";

export default function Home() {
  const [formData, setFormData] = useState({email: "",password: ""});
  const [isLogged, setIsLogged] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const handleChange = (event) => {
    setHasErrors(false);
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  useEffect(() => {
    const token = window.localStorage.getItem('token');

    axios.get('http://localhost/api/user', {
      headers: {
        'Authorization': 'Bearer '+token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(function () {
      redirect('/dashboard');
    });
  }, []); 

  useEffect(() => {
    if (isLogged) {
        redirect('/dashboard');
    }
  }, [isLogged]); 

  const login = async () => {  
    axios.post('http://localhost/api/login', formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(function (res) {
        window.localStorage.setItem('token', res.data.access_token);
        setIsLogged(true);
      })
      .catch(function (err) {
        setHasErrors(true);
      });
  }

  return (
    <section className="h-screen flex justify-center">
      <div className="h-full w-10/12">
        <div
          className="flex h-full flex-wrap items-center justify-center lg:justify-between">
          <div
            className="shrink-1 mb-12 grow-0 basis-auto md:mb-0 md:w-9/12 md:shrink-0 lg:w-6/12 xl:w-6/12">
            <img
              src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
              className="w-full"
              alt="Sample image" />
          </div>

          <div className="mb-12 md:mb-0 md:w-8/12 lg:w-5/12 xl:w-5/12">
            <form>
              <div
                className="flex flex-row mb-6 items-center justify-center lg:justify-start">
                <p className="mb-0 me-4 text-lg">Login</p>
              </div>

              <div className="relative mb-6">
              <label
                  htmlFor="email"
                  >Email
                </label>
                <input
                  type="text"
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15]"
                  id="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email} 
                  onChange={handleChange}
                  />
              </div>

              <div className="relative mb-6">
              <label
                  htmlFor="password"
                  >Password
                </label>
                <input
                  type="password"
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15]"
                  id="password"
                  name="password"
                  placeholder="Password" 
                  value={formData.password} 
                  onChange={handleChange}
                  />
              </div>
              
              <div className="text-center lg:text-left">
                <button
                  type="button"
                  className="inline-block w-full rounded bg-blue-300 px-7 pb-2 pt-3 text-sm font-medium uppercase leading-normal text-black shadow-primary-3"
                  onClick={() => login()}
                  >
                  Login
                </button>

                <p className="mb-0 mt-2 pt-1 text-sm font-semibold">
                  <a
                    href="#!"
                    className="text-black pl-1 transition duration-150 ease-in-out"
                    onClick={() => redirect('/register')}
                    >To create an account, click here to go to register</a
                  >
                </p>

                {!!hasErrors && <p className="mb-0 mt-2 pt-1 text-sm font-semibold">
                  <a
                    href="#!"
                    className="text-red-600 pl-1 transition duration-150 ease-in-out"
                    >Email or Password are invalid</a
                  >
                </p>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
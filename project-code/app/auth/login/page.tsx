"use client";

import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { supabase } from "@/lib/supabaseClient"
import { useEffect } from "react";
import toast from "react-hot-toast"
import { myAppHook } from "@/context/AppUtils";
import { useRouter } from "next/navigation";
import * as yup from "yup"
import {useForm} from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup";

const formSchema = yup.object().shape({
  email: yup.string().required("Email is required").email("Invalid Email value"),
  password: yup.string().required("Password is required")
});

export default function Login(){

  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn, setAuthToken, setIsLoading } = myAppHook();

  const {
    register,
    handleSubmit,
    formState: {
      isSubmitting, errors
    }
  } = useForm({
    resolver : yupResolver(formSchema)
  })

  useEffect( () => {

    if(isLoggedIn){
      router.push("/auth/dashboard");
      return;
    }
  }, [isLoggedIn])

   const handleSocialOauth = async(provider: "google" | "github") => {

      const {data, error} = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/dashboard`
        }
      });

      if(error){
        toast.error("Failed to login via Social Oauth");
      }
   }

   const onSubmit = async(formdata: any) => {

      setIsLoading(true)

      const { email, password } = formdata;

      const { data, error } = await supabase.auth.signInWithPassword({
        email, password
      })

      if(error){
        toast.error("Invalid login details")
      } else{
        if(data.session?.access_token){
          //console.log(data);
          setAuthToken(data.session?.access_token);
          localStorage.setItem("access_token", data.session?.access_token);
          setIsLoggedIn(true);
          setIsLoading(false)
          toast.success("User logged in successfully");
        }
      }
   }

   const handleRegisterRedirect = () => {
    router.push("/auth/register");
   }

    return <>

      <Navbar />

      <div className="container mt-5">
        <h2 className="text-center">Login</h2>
        <form onSubmit={ handleSubmit(onSubmit) } className="w-50 mx-auto mt-3">
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" { ...register("email") } />
            <p className="text-danger"> {errors.email?.message} </p>
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" { ...register("password") } />
            <p className="text-danger"> {errors.password?.message}</p>
          </div>

          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        <div className="text-center mt-3">
          <button className="btn btn-danger mx-2" onClick={ () => handleSocialOauth("google") }>Google</button>
          <button className="btn btn-dark mx-2" onClick={ () => handleSocialOauth("github") }>GitHub</button>
        </div>

        <p className="text-center mt-3">
          Don't have an account? <a onClick={ handleRegisterRedirect } style={{
            cursor: "pointer"
          }}>Register</a>
        </p>
      </div>

      <Footer />
    </>
}
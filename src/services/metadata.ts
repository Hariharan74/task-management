export const appMetaData=()=>{
    return {
        authform:{
            logintext:"Login",
            signtext:"Sign Up",
            loginWelcomeTitle:"Welcome Login System",
            signinWelcomeTitle:"Welcome Sign Up System",
            loginWelcomeSubtitle:"Your gateway to seamless transactions and easy payments.",
            signinWelcomeSubtitle:"Your gateway to seamless transactions and easy payments.",
            remembermetext:"Remember me",
            fields:{
                email:{
                    label:"Email",
                    placeholder:"admin@lemonpay.com",
                },
                password:{
                    label:"Password",
                    placeholder:"Min 8 Characters",
                },
                confirmpassword:{
                    label:"Confirm Password",
                    placeholder:"Min 8 Characters",
                }
            },
            validationMsg:{
                email:{
                    invalid:"Invalid email",
                    require:"Email is required"
                },
                password:{
                    invalid:"Password must be at least 8 characters",
                    require:"Password is required",
                    min:8
                },
                confirmpassword:{
                    invalid:"Passwords must match",
                    require:"Confirm Password is required",
                }
            }
        }
    }
}
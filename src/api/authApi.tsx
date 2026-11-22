  import { API_BASE_URL, ROUTES } from "../utility/url";

  //Login API
  export async function LoginApi(fData:any) {

      const apiRes = await fetch(API_BASE_URL + ROUTES.login, {
          method: "POST",
          headers: {
              "content-type": "application/json"
          },
          body: JSON.stringify(fData)

      });

      return await apiRes.json();
  }

//Signup API
export async function SignupApi(SignupData:any) {
  const SignupRes = await fetch(API_BASE_URL+ROUTES.signup,{
    method:"POST",
    headers:{
        "content-type":"application/json"
    },
    body:JSON.stringify(SignupData)
  })
  return await SignupRes.json();
}

export async function logoutApi(){
    const logoutRes = await fetch(API_BASE_URL+ROUTES.logout,{
        method:"POST",
        headers:{
            "content-type":"application/json"
        }
    })
    return await logoutRes.json();
}

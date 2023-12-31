import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom"
import { clearError, loginAsync } from '../../app/slices/user';
import { getCartByUserId, getFavouritesAsync } from '../../app/slices/product';


const LoginArea = () => {
    let dispatch = useDispatch();
    const history = useNavigate()

    let status = useSelector((state) => state.user.status);
    let user = useSelector((state) => state.user.user);
    let error = useSelector((state) => state.user.error);

    useEffect(() => {if(status) history("/");}, [])

    useEffect(()=>{
        if(status){
            dispatch(getCartByUserId(user.userId));
            dispatch(getFavouritesAsync());
            Swal.fire({
                icon: 'success',
                title: 'Giriş Başarılı',
                text: 'Hoşgeldiniz '+ user.name
            });
            history("/");
        }
    }, [user]);

    useEffect(()=>{
        if(error){
            Swal.fire({
                icon: 'error',
                title: 'Error during login.',
                text: error
            });
            dispatch(clearError())
        }
    }, [error]);

    // Login
    const login = (username, password) => {
        if(!status){
            dispatch(loginAsync({username, password}))
        }
    }

    return (
        <>
        { !status ? 
        <section id="login_area" className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 offset-lg-3 col-md-12 col-sm-12 col-12">
                            <div className="account_form">
                                <h3>Giriş Yap</h3>
                                <form onSubmit={(e)=>{e.preventDefault();login(e.target.uname_input.value, e.target.passwd_input.value);}}>
                                    <div className="default-form-box">
                                        <label>Kullanıcı adı veya Email<span className="text-danger">*</span></label>
                                        <input type="text" id="uname_input" className="form-control" required defaultValue="customer1@gmail.com"/>
                                    </div>
                                    <div className="default-form-box">
                                        <label>Şifre<span className="text-danger">*</span></label>
                                        <input type="password" id="passwd_input" className="form-control" required defaultValue="Admin123*" minLength="8"/>
                                    </div>
                                    <div className="login_submit">
                                        <button className="theme-btn-one btn-black-overlay btn_md" type="submit">Giriş Yap</button>
                                    </div>
                                    <div className="remember_area">
                                        <div className="form-check">
                                            <input type="checkbox" className="form-check-input" id="materialUnchecked"/>
                                            <label className="form-check-label" htmlFor="materialUnchecked">Beni Hatırla</label>
                                        </div>
                                    </div>
                                    <Link to="/register" className="active">Hesap Oluştur</Link>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
        </section>
        :
        <div className='container'> 
        <div className='row'>
        <div className="col-lg-6 offset-lg-3 col-md-12 col-sm-12 col-12">
            <h3>You are already logged in.</h3>
        </div>
        </div>
        </div>
        }
            
        </>
    )
}

export default LoginArea

import React, {useEffect, useState} from 'react'
import { useSelector, useDispatch } from "react-redux";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom"
import { clearError, registerAsync } from '../../app/slices/user';

const RegisterArea = () => {
    let dispatch = useDispatch();
    const history = useNavigate()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')


    let status = useSelector((state) => state.user.status);
    let userData = useSelector((state) => state.user.user);
    let registerError = useSelector((state) => state.user.error);
    
    useEffect(() => {if(status) history("/");}, [])

    // if register successful, move back to main page.
    useEffect(()=>{
        if(status){
            history("/");
        }
    }, [status])

    useEffect(() => {
        if(registerError){
            Swal.fire({
                icon: 'error',
                title: 'There was an error during registeration.',
                html: registerError,
            })
            dispatch(clearError())
        }
    }, [registerError]);

    const register = () => {
        dispatch(registerAsync({firstName, lastName, username, password, email}))
    }

    return (
        <>
            <section id="login_area" className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 offset-lg-3 col-md-12 col-sm-12 col-12">
                            <div className="account_form">
                                <h3>Kayıt Ol</h3>
                                <form onSubmit={(e)=>{e.preventDefault();register()}}>
                                    <div className="default-form-box">
                                        <label>Kullanıcı Adı<span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={username} onChange={e => setUsername(e.currentTarget.value)} required/>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6 default-form-box">
                                            <label>İsim<span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={firstName} onChange={e => {setFirstName(e.currentTarget.value)}} required/>
                                        </div>
                                        <div className="col-lg-6 default-form-box">
                                            <label>Soyadı<span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={lastName} onChange={e => {setLastName(e.currentTarget.value)}} required/>
                                        </div>
                                    </div>
                                    <div className="default-form-box">
                                        <label>Email<span className="text-danger">*</span></label>
                                        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.currentTarget.value)} required/>
                                    </div>
                                    <div className="default-form-box">
                                        <label>Şifre<span className="text-danger">*</span></label>
                                        <input type="password" className="form-control" value={password} onChange={e => setPassword(e.currentTarget.value)} required minLength="8"/>
                                    </div>
                                    <div className="login_submit">
                                        <button className="theme-btn-one btn-black-overlay btn_md" type="submit">Kayıt Ol</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default RegisterArea

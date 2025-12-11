import { useAppDispatch,useAppSelector } from "./app/hooks";
import { useEffect } from "react";
import { fetchUser } from "./features/auth/authActions";
import { RouterProvider } from "react-router-dom";
import router from "./router/AppRouter";

const App = () => {
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.auth);
    useEffect(()=>{
        
        dispatch(fetchUser());
    },[dispatch]);
    if (loading) return <div>Loading...</div>;
    return <RouterProvider router={router} />
}

export default App;
import { useNavigate } from 'react-router-dom';

export const WithRouter = (Component) => {
  const Wrapper = (props) => {
    const navigate = useNavigate();

    
    return (
      <Component
        navigate={navigate}
        {...props}
        />
    );
  };
  
  return Wrapper;
};
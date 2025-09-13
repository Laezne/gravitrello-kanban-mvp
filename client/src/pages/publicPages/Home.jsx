import { Box, Container, Flex, Button, Card, Image, Text } from "@chakra-ui/react";
import logo from '../../assets/logo_unknown_gravitrello.svg'
import { useNavigate } from "react-router";
import { useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContextProvider";

const Home = () => {
  const navigate = useNavigate();
  const {user} = useContext(AuthContext);

  useEffect(()=>{
    if(user){
      navigate('/user/dashboard');
    }
  }, [user]);

  return (
    <Container>
      <Flex justify="center" >
        <Box pt={20}>
          <Card.Root maxW="sm" overflow="hidden" textAlign="center" py={4}>
            <Image
              src={logo}
              alt="Logotipo Unknown Gravitrello"
              width="300px"
              filter="invert(100%)"
              mx="auto"
            />
            <Card.Body gap="2">
              <Card.Title>¡Te damos la bienvenida a nuestra plataforma!</Card.Title>
              <Card.Description>
                ¿Buscas una herramienta para gestionar tus proyectos? Nosotros te ayudamos.
              </Card.Description>
            </Card.Body>
            <Card.Footer display="flex" justifyContent="center" gap="2">
              <Button 
                  variant="solid" 
                  onClick={()=>navigate('/register')}
              >Comienza creando una cuenta
              </Button>
            </Card.Footer>
          </Card.Root>
        </Box>
      </Flex>
    </Container>
  )
}

export default Home;
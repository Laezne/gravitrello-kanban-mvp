import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Icon,
  useBreakpointValue,
  useDisclosure,
  Collapsible,
  Popover,
  Image,
} from '@chakra-ui/react'

import {
  HiMenu,
  HiX,
  HiChevronDown,
  HiChevronRight,
} from 'react-icons/hi'

import logo from '../../../assets/logo_unknown_gravitrello.svg'
import { Link, useNavigate } from 'react-router'

export default function PublicNavbar() {
  const { open, onToggle } = useDisclosure();

  const navigate = useNavigate();

  return (
    <Box>
      <Flex
        bg="brand.blue"
        color="white"
        minH="60px"
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottomWidth="1px"
        borderStyle="solid"
        borderColor="brand.lightBlue"  // Borde celeste
        align="center"
      >
        {/* Botón hamburguesa */}
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            variant="ghost"
            aria-label="Toggle Navigation"
            color="white"
            _hover={{ bg: 'brand.pink' }}
          >
            {open ? <HiX size={20} /> : <HiMenu size={24} />}
          </IconButton>
        </Flex>

        {/* Logo + links desktop */}
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Box>
            <Link to="/">
              <Image src={logo} alt="Ir al inicio" style={{ height: "40px" }} />
            </Link>
          </Box>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10} align="center">
            <DesktopNav />
          </Flex>
        </Flex>

        {/* Botones SignIn/SignUp */}
        <Stack
          flex={{ base: 1, md: 0 }}
          justify="flex-end"
          direction="row"
          spacing={6}
        >
          <Button
            fontSize="sm"
            fontWeight={400}
            variant="link"
            color="white"
            _hover={{ fontWeight: 'bold' }}
            onClick={()=>navigate('/login')}
          >
            Accede
          </Button>
          <Button
            display={{ base: 'none', md: 'inline-flex' }}
            fontSize="sm"
            fontWeight={600}
            color="white"
            bg="brand.pink"
            _hover={{ bg: 'brand.pink.light' }}
            onClick={()=>navigate('/register')}
          >
            Regístrate
          </Button>
        </Stack>
      </Flex>

      {/* Menú móvil */}
      <Collapsible.Root open={open}>
        <Collapsible.Content>
          <MobileNav />
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  )
}

const DesktopNav = () => {
  return (
    <Stack direction="row" spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover.Root>
            <Popover.Trigger>
              <Box
                as="a"
                p={2}
                href={navItem.href ?? '#'}
                fontSize="sm"
                fontWeight={500}
                color="white"
                _hover={{
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                {navItem.label}
              </Box>
            </Popover.Trigger>

            {navItem.children && (
              <Popover.Content
                border={0}
                boxShadow="xl"
                bg="white"
                p={4}
                rounded="xl"
                minW="sm"
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </Popover.Content>
            )}
          </Popover.Root>
        </Box>
      ))}
    </Stack>
  )
}

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Box
      as="a"
      href={href}
      role="group"
      display="block"
      p={2}
      rounded="md"
      _hover={{ bg: 'brand.lightBlue' }}
    >
      <Stack direction="row" align="center">
        <Box>
          <Text
            transition="all .3s ease"
            _groupHover={{ color: 'brand.pink' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {subLabel}
          </Text>
        </Box>
        <Flex
          transition="all .3s ease"
          transform="translateX(-10px)"
          opacity={0}
          _groupHover={{ opacity: 1, transform: 'translateX(0)' }}
          justify="flex-end"
          align="center"
          flex={1}
        >
          <Icon as={HiChevronRight} color="brand.pink" w={5} h={5} />
        </Flex>
      </Stack>
    </Box>
  )
}

const MobileNav = () => {
  return (
    <Stack bg="brand.blue" p={4} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }) => {
  const { open, onToggle } = useDisclosure()

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as="a"
        href={href ?? '#'}
        justify="space-between"
        align="center"
        _hover={{ textDecoration: 'none' }}
      >
        <Text fontWeight={600} color="white">
          {label}
        </Text>
        {children && (
          <Icon
            as={HiChevronDown}
            transition="all .25s ease-in-out"
            transform={open ? 'rotate(180deg)' : undefined}
            w={6}
            h={6}
            color="brand.lightBlue"
          />
        )}
      </Flex>

      <Collapsible.Root open={open}>
        <Collapsible.Content>
          <Stack
            mt={2}
            pl={4}
            borderLeftWidth="1px"
            borderStyle="solid"
            borderColor="brand.lightBlue"
            align="start"
          >
            {children &&
              children.map((child) => (
                <Box as="a" key={child.label} py={2} href={child.href} color="brand.deepPurple">
                  {child.label}
                </Box>
              ))}
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>
    </Stack>
  )
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/user/dashboard', 
  },
]

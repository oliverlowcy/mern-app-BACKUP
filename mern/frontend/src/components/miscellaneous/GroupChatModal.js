import { Box, Button, FormControl, Input, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import axios from 'axios'
import { ChatState } from '../../Context/ChatProvider'
import UserListItem from '../userAvatar/UserListItem'
import UserBadgeItem from '../userAvatar/UserBadgeItem'

//COMMENTX children is like in a parent.js file we do <childtag>___</childtag> so in our childtag.js we can access that __

const GroupChatModal = ({children}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const { user, chats, setChats } = ChatState();
    //COMMENTX the query to api is query not search even tho we setSearch because setSearch takes some time
    //(https://stackoverflow.com/questions/41278385/setstate-doesnt-update-the-state-immediately)
    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
        return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`http://localhost:5000/api/user?search=${query}`, config);
            console.log(data);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };


    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
        toast({
            title: "User already added",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top",
        });
        return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
        toast({
            title: "Please fill all the feilds",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top",
        });
        return;
        }

        try {
        const config = {
            headers: {
            Authorization: `Bearer ${user.token}`,
            },
        };
        const { data } = await axios.post(
            `http://localhost:5000/api/chat/group`,
            {
            name: groupChatName,
            users: JSON.stringify(selectedUsers.map((u) => u._id)),
            },
            config
        );
        setChats([data, ...chats]);
        onClose();
        toast({
            title: "New Group Chat Created!",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom",
        });
        } catch (error) {
        toast({
            title: "Failed to Create the Chat!",
            description: error.response.data,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
        });
        }
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };

    return (
    <>
        <span onClick={onOpen}>{children}</span>
        
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >Create Group Chat</ModalHeader>
            <ModalCloseButton />
            <ModalBody display="flex" flexDir="column" alignItems="center">
                <FormControl>
                
                <Input
                    placeholder="Chat Name"
                    mb={3}
                    onChange={(e) => setGroupChatName(e.target.value)}
                    //
                />
                </FormControl>
                <FormControl>
                    <Input
                        placeholder="Add Users eg: John, Piyush, Jane"
                        mb={1}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </FormControl>
                <Box w="100%" d="flex" flexWrap="wrap">
                    {selectedUsers.map((u) => (
                        <UserBadgeItem
                        key={u._id}
                        user={u}
                        handleFunction={() => handleDelete(u)}
                        />
                        
                    ))}
                </Box>
                {loading ? (
                // <ChatLoading />
                <div>Loading...</div>
                ) : (
                searchResult
                    ?.slice(0, 4)
                    .map((user) => (
                    <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={() => handleGroup(user)}
                    />
                    
                    ))
                )}
            </ModalBody>

            <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="blue">
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
        </Modal>
    </>
    )
}

export default GroupChatModal

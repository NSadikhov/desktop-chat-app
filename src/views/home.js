import React, { useState, useRef, useEffect, createRef } from 'react'
import { useHistory } from 'react-router-dom';
import classes from '../styles/home.module.css';

import { uploadProfilePhoto, editProfileInfo, setUserStatus, deleteContact } from '../store/actions/userActions';
import { sendMessageOrFile, getChatMessages, readMessages, uploadFiles, downloadFile, getCloudContent } from '../store/actions/dataActions';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getTime, getLastSeen } from '../utils/dateTime';

import FiberManualRecordRoundedIcon from '@material-ui/icons/FiberManualRecordRounded';
import CloudRoundedIcon from '@material-ui/icons/CloudRounded';
import PermIdentityRoundedIcon from '@material-ui/icons/PermIdentityRounded';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import MoreVertRoundedIcon from '@material-ui/icons/MoreVertRounded';
import SendRoundedIcon from '@material-ui/icons/SendRounded';
import DeleteForeverRoundedIcon from '@material-ui/icons/DeleteForeverRounded';
import DoneAllRoundedIcon from '@material-ui/icons/DoneAllRounded';
import DoneRoundedIcon from '@material-ui/icons/DoneRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import PhoneTwoToneIcon from '@material-ui/icons/PhoneTwoTone';
import LanguageRoundedIcon from '@material-ui/icons/LanguageRounded';
import GroupAddOutlinedIcon from '@material-ui/icons/GroupAddOutlined';
import AddCircleOutlineRoundedIcon from '@material-ui/icons/AddCircleOutlineRounded';
import AttachFileRoundedIcon from '@material-ui/icons/AttachFileRounded';
import PersonRoundedIcon from '@material-ui/icons/PersonRounded';
import ImageRoundedIcon from '@material-ui/icons/ImageRounded';
import VideocamRoundedIcon from '@material-ui/icons/VideocamRounded';
import LinkRoundedIcon from '@material-ui/icons/LinkRounded';
import DescriptionRoundedIcon from '@material-ui/icons/DescriptionRounded';
import GetAppRoundedIcon from '@material-ui/icons/GetAppRounded';
import InsertDriveFileRoundedIcon from '@material-ui/icons/InsertDriveFileRounded';
import Badge from '@material-ui/core/Badge';

import NameIcon from '../assets/images/Autograph.svg';
import AttachIcon from '../assets/images/Share Rounded.svg';
import NumberInfoIcon from '../assets/images/More Info.svg';
import ImageIcon from '../assets/images/Image.svg';
import VideoIcon from '../assets/images/Video Call.svg';
import LinkIcon from '../assets/images/Link.svg';
import FileIcon from '../assets/images/File.svg';

import Bubbles from '../components/Bubbles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import AddContact from '../components/AddContact';
import LogOut from '../components/LogOut';
import EmojiList from '../components/EmojiList';


const bgColors = [
    '#a695e7',
    '#7bc862',
    '#ee7aae',
    '#eda86c',
    '#6ec9cb',
    '#65aadd',
    '#e17076',
]

const getInitials = (displayName) => displayName.split(' ').map((each) => each[0]).join('');

const defaultPicBgColor = bgColors[Math.floor(Math.random() * 8)];  // `hsl(${Math.random() * 361}, 65%, 45%)`;

const getRandomBgColor = () => bgColors[Math.floor(Math.random() * 8)];

function Home(props) {
    const history = useHistory();

    const { user: { credentials }, data, data: { chats, onlineUsers, Cloud } } = props;

    const [initials, setInitials] = useState('');

    useEffect(() => {
        if (credentials)
            !credentials.photoURL && setInitials(getInitials(credentials.displayName));
    }, [credentials])

    const [searchIconClicked, setSearchIconClicked] = useState(false);
    const [settingsIconClicked, setSettingsIconClicked] = useState(false);
    const [profileIconClicked, setProfileIconClicked] = useState(false);
    const [addContactClicked, setAddContactClicked] = useState(false);
    const [logOutClicked, setLogOutClicked] = useState(false);

    const [searchValue, setSearchValue] = useState('');

    const [selectedChatId, setSelectedChatId] = useState(undefined);

    const handleChatBoxClick = (chat) => {
        if (chat) {
            if (chat.id !== selectedChatId) {
                setSelectedChatId(chat.id);
                if (!data[chat.id]) props.getChatMessages(chat.id, chat.shared_key);
                handleReadMessages(chat.id);
            }
        }
        else {
            setSelectedChatId('Cloud');
            if (!Cloud) props.getCloudContent();
        }

        textAreaRef.current?.focus();
    }

    const handleClosingAnimation = (callback, durationInMS) => { const timeOut = setTimeout(() => { callback(); clearTimeout(timeOut); }, durationInMS) };

    const flScreenBgRef = useRef(null);
    const profileRef = useRef(null);
    const settingsRef = useRef(null);

    const popUpRef = createRef();

    const resizerLeftRef = useRef(null);
    const resizerRightRef = useRef(null);

    const handleMouseMoveL = (e) => {
        if (e.clientX >= 225 && e.clientX < document.body.clientWidth * 0.6) {
            resizerLeftRef.current.parentElement.style.minWidth = e.clientX + 'px';
            resizerLeftRef.current.parentElement.style.maxWidth = e.clientX + 'px';

        }
    }

    const handleMouseMoveR = (e) => {
        const size = document.body.clientWidth - e.clientX;
        if (size >= 225 && size <= 300) {
            resizerRightRef.current.parentElement.style.minWidth = size + 'px';
            resizerRightRef.current.parentElement.style.maxWidth = size + 'px';
        }
    }

    const handleMouseUpL = () => {
        document.body.style.cursor = 'default';
        document.removeEventListener('mousemove', handleMouseMoveL);
        document.removeEventListener('mouseup', handleMouseUpL);
    }

    const handleMouseUpR = () => {
        document.body.style.cursor = 'default';
        document.removeEventListener('mousemove', handleMouseMoveR);
        document.removeEventListener('mouseup', handleMouseUpR);
    }

    const handlePhotoChange = (e) => e.currentTarget.files && props.uploadProfilePhoto(e.currentTarget.files.item(0));
    const handleFileChange = (e) => {
        if (e.currentTarget.files) {

            if (selectedChatId === 'Cloud') {
                props.uploadFiles(
                    Array.from(e.currentTarget.files),
                    selectedChatId,
                );
            } else {
                const data = chats.find(chat => chat.id === selectedChatId);
                props.uploadFiles(Array.from(e.currentTarget.files), selectedChatId, data.lastMessageInfo, data.nonSeenMessages);
            }
        }
    };

    const handleProfileIconClick = () => setProfileIconClicked(true);

    const photoInputRef = useRef(null);
    const handlePhotoInputClick = () => photoInputRef.current.click();

    const fileInputRef = useRef(null);
    const handleFileInputClick = () => fileInputRef.current.click();

    const profileSettingsDetailsRef = useRef(null);
    const profileSettingsEditRef = useRef(null);

    const profileFNameRef = useRef(null);
    const profileLNameRef = useRef(null);

    const handleProfileSettingsAnimClosing = () => {
        profileSettingsEditRef.current.style.transform = 'translateX(100%)';
        handleClosingAnimation(() => {
            profileSettingsEditRef.current.style.display = 'none';
            profileSettingsDetailsRef.current.style.display = 'block';
            handleClosingAnimation(() => {
                profileSettingsDetailsRef.current.style.transform = 'translateX(0)';
            }, 100);
        }, 300);
    }

    // const getChatUserID = (userIDs) => userIDs.filter(each => each != credentials.uid)[0];

    // * Temp Approach
    const [userBgColorList, setUserBgColorList] = useState('');

    const textAreaRef = useRef(null);
    const [key, setKey] = useState(null);

    const lastMessageRef = useRef(null);
    const handleMessageSubmit = () => {
        // TODO: fix Cloud chat
        if (textAreaRef.current.value.trim() !== '') {
            if (selectedChatId === 'Cloud') {
                props.sendMessageOrFile({
                    id: selectedChatId,
                    message: textAreaRef.current.value,
                });
            }
            else {
                const data = chats.find(chat => chat.id === selectedChatId);
                props.sendMessageOrFile({
                    id: selectedChatId,
                    message: textAreaRef.current.value,
                    lastMessageInfo: data.lastMessageInfo,
                    nonSeenMessages: data.nonSeenMessages,
                    sharedKey: data.shared_key
                });
            }
        }
        textAreaRef.current.value = '';
        textAreaRef.current.focus();
    }

    const handleDeleteContact = (e) => {
        props.deleteContact(selectedChatId);
        setSelectedChatId(undefined);
    }

    const [isFocused, setIsFocused] = useState(true);

    const onFocus = () => {
        setIsFocused(true);
        props.setUserStatus(true);
    }

    const handleReadMessages = (_selectedChatId) => {
        if (_selectedChatId && _selectedChatId !== 'Cloud')
            props.readMessages(_selectedChatId);
    }

    const handleDownloadFile = (url, name, id, index) => props.downloadFile(url, name, id, index);

    const openFile = (path) => bridge.fileApi.openFile(path);

    const onBlur = () => {
        console.log(2)
        setIsFocused(false);
        props.setUserStatus(false);
    }

    useEffect(() => {
        if (lastMessageRef.current) lastMessageRef.current?.scrollIntoView();
    }, [lastMessageRef.current])

    useEffect(() => {
        console.log(222);
        console.log(isFocused);
        if (isFocused) handleReadMessages(selectedChatId);
    }, [chats])

    useEffect(() => {
        if (isFocused) {
            textAreaRef.current?.focus();
            handleReadMessages(selectedChatId);
        }
    }, [isFocused])

    useEffect(() => {
        bridge.windowApi.setListener(onFocus, onBlur);
    }, [])

    return (
        credentials &&
        <div className={classes.container}>
            <div className={classes.left}>
                <div className={classes.profile}>
                    {credentials.photoURL
                        ? <img src={credentials.photoURL} onClick={handleProfileIconClick} />
                        : <div style={{ backgroundColor: defaultPicBgColor }} onClick={handleProfileIconClick} className={classes.default_profile_pic}>
                            {initials}
                        </div>
                    }
                    <div className={classes.name_status}>
                        <span onClick={handleProfileIconClick}>{credentials.displayName}</span>
                        <FiberManualRecordRoundedIcon className={classes.status} />
                    </div>
                    {profileIconClicked &&
                        <div ref={profileRef} className={classes.profile_setting}>
                            <input ref={photoInputRef} hidden onChange={handlePhotoChange} type='file' />

                            {credentials.photoURL
                                ? <div onClick={handlePhotoInputClick} className={classes.photo_img_edit}><img src={credentials.photoURL} />
                                    <div><span>Edit</span></div>
                                </div>
                                : <div onClick={handlePhotoInputClick} style={{ backgroundColor: defaultPicBgColor }} className={classes.default_profile_setting_pic}>
                                    {initials}
                                    <div className={classes.photo_def_edit}><span>Edit</span></div>
                                </div>
                            }

                            <div className={classes.profile_setting_details}>

                                <div ref={profileSettingsDetailsRef} className={classes.profile_setting_details_box}>
                                    <div onClick={() => {
                                        profileSettingsDetailsRef.current.style.transform = 'translateX(-100%)';
                                        handleClosingAnimation(() => {
                                            profileSettingsDetailsRef.current.style.display = 'none';
                                            profileSettingsEditRef.current.style.display = 'flex';
                                            handleClosingAnimation(() => {
                                                profileSettingsEditRef.current.style.transform = 'translateX(0)';
                                                profileFNameRef.current.focus();
                                            }, 100);
                                        }, 300);
                                    }}>
                                        <PermIdentityRoundedIcon className={classes.name_icon} />
                                        <span>{credentials.displayName}</span>
                                    </div>
                                    <div>
                                        <PhoneTwoToneIcon className={classes.phone_icon} />
                                        <span>{credentials.phoneNumber}</span>
                                    </div>
                                </div>

                                <div ref={profileSettingsEditRef} className={classes.profile_setting_edit_box}>
                                    <h1>Edit Your Name</h1>
                                    <TextField spellCheck={false} inputRef={profileFNameRef} defaultValue={credentials.displayName.split(' ')[0]} name='first_name' onBlur={() => { }} label='First Name' variant='standard' color='primary' size='small' margin='none' />
                                    <TextField spellCheck={false} inputRef={profileLNameRef} defaultValue={credentials.displayName.split(' ')[1]} name='last_name' onBlur={() => { }} label='Last Name' variant='standard' color='primary' size='small' margin='none' />
                                    <div className={classes.profile_setting_edit_box_btns}>
                                        <Button color='primary' size='small'
                                            onClick={handleProfileSettingsAnimClosing}>
                                            Cancel
                                        </Button>
                                        <Button color='primary' size='small'
                                            onClick={() => props.editProfileInfo({
                                                first_name: profileFNameRef.current.value,
                                                last_name: profileLNameRef.current.value
                                            }).then(handleProfileSettingsAnimClosing)}
                                        >Save</Button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    }

                </div>
                <div className={classes.chat_list}>
                    {String('cloud').includes(searchValue.toLowerCase()) &&
                        <div name='Cloud' className={classes.cloud} onClick={() => handleChatBoxClick()}>
                            <CloudRoundedIcon color='error' className={classes.cloud_icon} />
                            <span>Cloud</span>
                        </div>
                    }
                    {chats?.map(chat => {
                        if (userBgColorList[chat.id] === undefined) setUserBgColorList((prevS) => ({ ...prevS, [chat.id]: getRandomBgColor() }));
                        return (<div style={{ display: chat[chat.toId].displayName?.toLowerCase().includes(searchValue.toLowerCase()) || chat[chat.toId].phoneNumber.toLowerCase().includes(searchValue.toLowerCase()) ? 'flex' : 'none' }}
                            key={chat.id} name={chat.id} className={classes.chat_box} onClick={() => handleChatBoxClick(chat)}>
                            <Badge variant='dot' overlap="circle" color="primary" anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }} className={classes.chat_photo_badge} data-active={onlineUsers?.[chat.toId]?.online}>
                                {chat[chat.toId].photoURL ?
                                    <img src={chat[chat.toId].photoURL} className={classes.chat_box_photo} />
                                    :
                                    <div style={{ backgroundColor: userBgColorList[chat.id] }} className={classes.chat_box_df_pic}>
                                        <PersonRoundedIcon />
                                    </div>
                                }
                            </Badge>
                            <div className={classes.chat_box_content} style={{ height: (chat.lastMessageInfo?.message || chat.lastMessageInfo?.file) ? '100%' : 'auto' }}>
                                <div>
                                    <span>{chat[chat.toId].displayName ?? chat[chat.toId].phoneNumber}</span>
                                    {chat.lastMessageInfo &&
                                        <div className={classes.chat_box_content_timeInfo}>
                                            {chat.lastMessageInfo.sentBy === credentials.uid &&
                                                (chat.lastMessageInfo.seen ?
                                                    <DoneAllRoundedIcon color='primary' className={classes.tick} /> :
                                                    <DoneRoundedIcon color='primary' className={classes.tick} />
                                                )
                                            }
                                            {chat.lastMessageInfo?.time &&
                                                <span>{getTime(chat.lastMessageInfo?.time)}</span>
                                            }
                                        </div>
                                    }
                                </div>
                                {(chat.lastMessageInfo?.message || chat.lastMessageInfo?.file) &&
                                    <div className={classes.chat_box_content_message}>
                                        <span>{chat.lastMessageInfo?.message ?? chat.lastMessageInfo?.file.name}</span>
                                        <div style={{
                                            visibility: (chat.lastMessageInfo?.sentBy !== credentials.uid && chat.nonSeenMessages) ?
                                                ((isFocused && chat.id === selectedChatId) ? 'hidden' : 'visible') : 'hidden'
                                        }}>
                                            {chat.nonSeenMessages}
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>)
                    })}
                </div>
                <div className={classes.search_settings}>
                    {searchIconClicked ?
                        <div className={classes.custom_search_input}>
                            <input
                                spellCheck={false}
                                type='text'
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.currentTarget.value);
                                }}
                                onBlur={(e) => {
                                    if (searchValue === '') {
                                        e.currentTarget.style.transform = 'scaleX(0)';
                                        e.currentTarget.placeholder = '';
                                        e.currentTarget.style.opacity = 0;
                                        handleClosingAnimation(() => setSearchIconClicked(false), 275);
                                    }
                                }}
                                className={classes.search_field} autoFocus placeholder='Search'
                            />
                            {searchValue !== '' &&
                                <CloseRoundedIcon color='action' className={classes.search_empty_icon}
                                    onClick={() => { setSearchValue(''); setSearchIconClicked(false); }}
                                />
                            }
                        </div>
                        :
                        <SearchRoundedIcon onClick={() => setSearchIconClicked(true)}
                            color='action' className={classes.search_icon}
                        />
                    }
                    <MoreVertRoundedIcon
                        onClick={() => {
                            setSettingsIconClicked(true);
                        }} color='action' className={classes.settings_icon} />
                    {settingsIconClicked &&
                        <div ref={settingsRef} className={classes.settings}>
                            <div onClick={() => { setAddContactClicked(true); setSettingsIconClicked(false); }}>
                                <AddCircleOutlineRoundedIcon className={classes.settings_list_icon} />
                                Add contact
                            </div>
                            {/* <div onClick={() => { }}>
                                <GroupAddOutlinedIcon className={classes.settings_list_icon} />
                                Create group
                            </div> */}
                            <div onClick={() => { }}>
                                <LanguageRoundedIcon className={classes.settings_list_icon} />
                                Language
                            </div>
                            <div onClick={() => { setLogOutClicked(true); setSettingsIconClicked(false); }}>
                                <ExitToAppRoundedIcon className={classes.settings_list_icon} />
                                Log out
                            </div>
                        </div>
                    }
                </div>
                <div ref={resizerLeftRef} className={classes.resize + ' ' + classes.rsz_left} onMouseDown={() => {
                    document.body.style.cursor = 'e-resize';
                    document.addEventListener('mousemove', handleMouseMoveL);
                    document.addEventListener('mouseup', handleMouseUpL);
                }}
                />
            </div>
            {(() => {
                let selectedChatData = chats?.find(each => each.id === selectedChatId);
                selectedChatId === "Cloud" && (selectedChatData = { toId: "Cloud", Cloud: { displayName: "Cloud" } });
                return (<>
                    <div className={classes.middle}>
                        {!selectedChatId ?
                            <>
                                <Bubbles />
                                <div className={classes.none_selected_chat}>
                                    Start messaging
                                </div>
                            </>
                            :
                            <div className={classes.selected_chat}>
                                <div className={classes.chat_header}>
                                    <h1>{selectedChatData[selectedChatData.toId].displayName ?? selectedChatData[selectedChatData.toId].phoneNumber}</h1>
                                    {selectedChatId !== 'Cloud' &&
                                        <span>last seen {onlineUsers?.[selectedChatData.toId]?.lastSeen ? getLastSeen(onlineUsers[selectedChatData.toId].lastSeen) : 'recently'}</span>
                                    }
                                </div>
                                <div className={classes.chat_container}>
                                    {data[selectedChatId]?.data?.map((each, index) =>
                                        each?.time ?
                                            <div ref={index === 0 ? lastMessageRef : null} key={each.id} className={each.sentBy === credentials.uid ? classes.message_right : classes.message_left}>
                                                {each.message ?
                                                    <p className={classes.selectable}>
                                                        {each.message}
                                                    </p>
                                                    :
                                                    <div className={classes.chat_container_message_content}>
                                                        <DescriptionRoundedIcon className={classes.chat_container_message_file_icon} onClick={() => !each.localPath ? handleDownloadFile(each.file.url, each.file.name, selectedChatId, index) : openFile(each.localPath)} />
                                                        <p className={classes.selectable}>
                                                            {each.file.name}
                                                        </p>
                                                    </div>
                                                }
                                                <div className={classes.chat_container_message_time}>
                                                    <span>{getTime(each.time)}</span>
                                                    {each.sentBy === credentials.uid &&
                                                        (each.seen ?
                                                            <DoneAllRoundedIcon color='primary' className={classes.tick} /> :
                                                            <DoneRoundedIcon color='primary' className={classes.tick} />
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            :
                                            null

                                    )}

                                </div>
                                <div className={classes.input_bar}>
                                    <EmojiList inputRef={textAreaRef} />
                                    <input ref={fileInputRef} hidden onChange={handleFileChange} type='file' />
                                    <AttachFileRoundedIcon onClick={handleFileInputClick} className={classes.upload_icon} />
                                    <textarea
                                        spellCheck={false}
                                        className={classes.text_field}
                                        autoFocus
                                        ref={textAreaRef}
                                        placeholder='Write a message...'
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") setKey('Enter');
                                        }}
                                        onChange={(e) => {
                                            e.currentTarget.style.height = 'auto';
                                            if (key === 'Enter') { handleMessageSubmit(); return setKey(null); }

                                            if (e.currentTarget.scrollHeight <= 250) {
                                                e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                                // console.log(e.currentTarget.scrollHeight);
                                            }
                                        }}
                                        rows={1}
                                    />
                                    <SendRoundedIcon onClick={handleMessageSubmit} color='primary' className={classes.send_icon} />
                                </div>
                            </div>

                        }
                    </div>
                    {selectedChatId ?
                        <div className={classes.right}>
                            <div ref={resizerRightRef} className={classes.resize + ' ' + classes.rsz_right} onMouseDown={() => {
                                document.body.style.cursor = 'e-resize';
                                document.addEventListener('mousemove', handleMouseMoveR);
                                document.addEventListener('mouseup', handleMouseUpR);
                            }} />
                            <div className={classes.right_header}>
                                <h1>{selectedChatId !== 'Cloud' ? 'User Info' : 'Chat Info'}</h1>
                            </div>
                            <div className={classes.user_info}>
                                {selectedChatId !== 'Cloud' ?
                                    (selectedChatData[selectedChatData.toId].photoURL
                                        ? <img src={selectedChatData[selectedChatData.toId].photoURL} />
                                        : <div style={{ backgroundColor: userBgColorList[selectedChatId] }} className={classes.user_info_df_pic}>
                                            <PersonRoundedIcon fontSize='large' />
                                        </div>)
                                    :
                                    <CloudRoundedIcon fontSize='large' color='error' />
                                }
                                <div className={classes.user_info_content}>
                                    <h1 className={classes.selectable}>{selectedChatData[selectedChatData.toId].displayName ?? selectedChatData[selectedChatData.toId].phoneNumber}</h1>
                                    {selectedChatId !== 'Cloud' &&
                                        <span>last seen {onlineUsers?.[selectedChatData.toId]?.lastSeen ? getLastSeen(onlineUsers[selectedChatData.toId].lastSeen, true) : 'recently'}</span>
                                    }
                                </div>
                            </div>
                            <div className={classes.user_media_settings}>
                                {selectedChatId !== 'Cloud' &&
                                    <div className={classes.top}>
                                        <div>
                                            <PhoneTwoToneIcon />
                                            <span>{selectedChatData[selectedChatData.toId].phoneNumber}</span>
                                        </div>
                                    </div>
                                }
                                <div className={classes.center}>
                                    <div>
                                        <ImageRoundedIcon />
                                        <span>Images</span>
                                    </div>
                                    <div>
                                        <VideocamRoundedIcon />
                                        <span>Videos</span>
                                    </div>
                                    <div>
                                        <LinkRoundedIcon />
                                        <span>Links</span>
                                    </div>
                                    <div>
                                        <InsertDriveFileRoundedIcon />
                                        <span>Files</span>
                                    </div>
                                </div>
                                {selectedChatId !== 'Cloud' &&
                                    <div className={classes.bottom}>
                                        <div onClick={handleDeleteContact}>
                                            <DeleteForeverRoundedIcon />
                                            <span>Delete contact</span>
                                        </div>
                                    </div>
                                }
                            </div>

                        </div>
                        : null}
                </>)
            })()}
            {
                (profileIconClicked || settingsIconClicked || addContactClicked || logOutClicked) &&
                <div ref={flScreenBgRef} onClick={(e) => {
                    e.currentTarget.style.opacity = '0';
                    if (profileIconClicked) profileRef.current.style.transform = 'scale(0,0)';
                    if (settingsIconClicked) settingsRef.current.style.transform = 'scale(0,0)';
                    if (addContactClicked || logOutClicked) popUpRef.current.style.opacity = '0';
                    handleClosingAnimation(() => {
                        profileIconClicked ? setProfileIconClicked(false) :
                            settingsIconClicked ? setSettingsIconClicked(false) :
                                addContactClicked ? setAddContactClicked(false) :
                                    logOutClicked ? setLogOutClicked(false) :
                                        null
                    }, 250);
                }} className={classes.fl_screen_bg} />
            }
            {
                addContactClicked &&
                <AddContact ref={popUpRef} flScreenBgRef={flScreenBgRef} />
            }
            {
                logOutClicked &&
                <LogOut ref={popUpRef} flScreenBgRef={flScreenBgRef} history={history} />
            }
        </div>
    )
}

const mapStateToProps = (state) => ({
    user: state.user,
    data: state.data
})

const mapActionsToProps = { uploadProfilePhoto, editProfileInfo, sendMessageOrFile, uploadFiles, downloadFile, getChatMessages, deleteContact, getCloudContent, setUserStatus, readMessages };

Home.propTypes = {
    user: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapActionsToProps)(Home)

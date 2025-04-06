import { Divider, Modal } from "@douyinfe/semi-ui"
import { forwardRef, useImperativeHandle, useState } from "react"

const AuthTable = (props, ref) => {
    const [visible, setVisible] = useState(false)
    const openAuth = () => {
        console.log('openAuth')
        setVisible(true)
    }
    useImperativeHandle(ref, () => ({
        openAuth,
    }));
    return (
        <>
            <div>
                <Divider></Divider>
            </div>
            <Modal visible={visible}>
                sdsdfg
            </Modal>
        </>
    )
}

export default forwardRef(AuthTable)
import { useEffect, useState } from 'react'
import { useWbEditor } from '../context'
import { Form, Switch } from 'antd'

export const PreferenceConfig = function PreferenceConfigIn() {
  const { wbEditor } = useWbEditor()

  const [preference, setPreference] = useState(wbEditor.preferenceConfig.preference)

  useEffect(() => {
    setPreference(wbEditor.preferenceConfig.preference)

    return wbEditor.preferenceConfig.eventEmitter.on('preferenceChange', preference => {
      setPreference(preference)
    })
  }, [wbEditor])

  return (
    <div>
      <Form.Item
        style={{ marginBottom: 0 }}
        label="resize 时允许出现倾斜"
        tooltip="只对新创建的图形有效, 如果一个图形已经出现倾斜, 无法将其修正"
        layout="vertical"
      >
        <Switch
          checked={preference.skewInResize}
          onChange={checked => wbEditor.preferenceConfig.setConfig({ skewInResize: checked })}
        />
      </Form.Item>
    </div>
  )
}

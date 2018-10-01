import React from 'react'
import { PureComponent } from 'react'

export default class UploadedFolder extends PureComponent {
    render() {
        return <div>
            <h2>Hash is QWRJQENFKDMFofjif</h2>
            <h3>Folder contains 4 files</h3>
            <ul>
                <li key={1}>subfolder</li>
                <li key={2}>file "johndoe", size 123 bytes, hash "Qmdfeasdfefwefnw"</li>
                <li key={3}>file "abc", size 1 kb, hash "Qmdfeasdfefwefnw"</li>
                <li key={4}>file "example.txt", size 10 mb, hash "Qmdfeasdfefwefnw"</li>
            </ul>
        </div>
    }
}

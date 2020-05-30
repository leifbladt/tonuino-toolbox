const NodeID3 = require('node-id3');
const mm = require('musicmetadata');
const util = require('util');
const path = require('path');
const fs = require('fs');
const metadata = util.promisify(mm);


const mp3_id3_editor = {

    updateTag: async (file_path, tag, value) => {

        /*
         * vorhandene Tag Daten holen
         */
        let tag_data = await mp3_id3_editor.readMeta(file_path);

        /*
         * Neuen Tag Wert setzen
         */
        tag_data[tag] = value;

        /*
         * In Datei schreiben
         */
        let values = {};
        values[tag] = value;

        console.log('update tag');
        console.log(tag, value);

        try {
            await NodeID3.update(values, file_path);
            return tag_data;
        }
        catch (e) {
            console.error('update tag error');
            console.error(e);
        }

        return false;

    },

    readMeta: async (file_path) => {

        let meta = null;
        let tags = {
            title: path.basename(file_path),
            track: '',
            album: '',
            artist: '',
            trackNumber: ''
        };

        try {
            meta = await metadata(fs.createReadStream(file_path));

            if(meta.title !== undefined) {
                tags.title = meta.title;
            }
            if(meta.artist !== undefined && meta.artist.length > 0) {
                tags.artist = meta.artist.join(',');
            }
            if(meta.track !== undefined && meta.track.no !== undefined && parseInt(meta.track.no) > 0) {
                tags.trackNumber = meta.track.no;
            }
            if(meta.album !== undefined) {
                tags.album = meta.album;
            }

        }
        catch (e) {
            console.error('get meta error');
            console.error(e);
        }

        /*
         * Wenn keine Meta Tags vorhanden schreibe
         */
        if(!meta) {

            try {
                await NodeID3.create(tags);
                await NodeID3.write(tags, file_path);
            }
            catch (e) {
                console.error('tag create error');
                console.error(e);
            }
        }

        return tags;

    }

};

module.exports = mp3_id3_editor;
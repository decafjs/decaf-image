"use strict";
/**
 * Created with WebStorm.
 * User: mschwartz
 * Date: 9/28/13
 * Time: 8:19 PM
 */

/*global toString, module, exports, java */

// GIF file manipulation, including support for animated GIF.
// https://github.com/rtyley/animated-gif-lib-for-java
var {GifDecoder, AnimatedGifEncoder} = Packages.com.madgag.gif.fmsware,
    {BufferedImage} = java.awt.image,
    {ByteArrayInputStream, ByteArrayOutputStream} = java.io;

function Gif( arg ) {
    var decoder = new GifDecoder(),
        status;
    if ( toString.apply(arg) === '[object JavaArray]' ) {
        status = decoder.read(new ByteArrayInputStream(arg));
    }
    else {
        status = decoder.read(arg);
    }
    switch ( status ) {
        case GifDecoder.STATUS_FORMAT_ERROR:
            throw new Error('Error decoding file');
        case GifDecoder.STATUS_OPEN_ERROR:
            throw new Error('I/O error');
    }
    this._numFrames = decoder.getFrameCount();
    this._loopCount = decoder.getLoopCount();
    this._frames = [];
    for ( var i = 0; i < this._numFrames; i++ ) {
        this._frames.push({
            image : decoder.getFrame(i),
            delay : decoder.getDelay(i)
        });
    }
    this._dimension = decoder.getFrameSize();
}
decaf.extend(Gif.prototype, {
    width       : function() {
        return this._dimension.width;
    },
    height      : function() {
        return this._dimension.height;
    },
    numFrames   : function() {
        return this._numFrames;
    },
    loopCount   : function() {
        return this._loopCount;
    },

    SCALE_DEFAULT: java.awt.Image.SCALE_DEFAULT,
    SCALE_FAST: java.awt.Image.SCALE_FAST,
    SCALE_SMOOTH: java.awt.Image.SCALE_SMOOTH,
    SCALE_REPLICATE: java.awt.Image.SCALE_REPLICATE,
    SCALE_AREA_AVERAGING: java.awt.Image.SCALE_AREA_AVERAGING,

    scale       : function( w, h, hint ) {
        for ( var i = 0, len = this._frames.length; i < len; i++ ) {
            var frame = this._frames[i],
                img = frame.image.getScaledInstance(w, h, hint || this.SCALE_DEFAULT);

            var bi = new BufferedImage(img.getWidth(), img.getHeight(), BufferedImage.TYPE_4BYTE_ABGR);
            var g = bi.createGraphics();
            g.drawImage(img, null, null);
            frame.image = bi;
        }
        this._dimension.width = w;
        this._dimension.height = h;
        return this;
    },
    toByteArray : function() {
        console.log('toByteArray')
        var encoder = new AnimatedGifEncoder(),
            os = new ByteArrayOutputStream();

        encoder.start(os);
        encoder.setSize(this._dimension.width, this._dimension.height);
        encoder.setRepeat(this._loopCount);
        for ( var i = 0, len = this._frames.length; i < len; i++ ) {
            var frame = this._frames[i];
            encoder.addFrame(frame.image);
            encoder.setDelay(frame.delay);
        }
        encoder.finish();
        return os.toByteArray();
    }
});

module.exports = Gif;

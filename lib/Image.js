/**
 * Created with WebStorm.
 * User: mschwartz
 * Date: 9/28/13
 * Time: 1:26 PM
 */

var {BufferedImage, AffineTransformOp} = java.awt.image,
    {AffineTransform} = java.awt.geom,
    {ImageIO} = javax.imageio,
    {ByteArrayInputStream, ByteArrayOutputStream} = java.io,
    File = require('File');

var magickPaths = ['/usr/local/bin', '/usr/bin' ];
    magick = null;

decaf.each(magickPaths, function(path) {
    if (!magick && new File(path + '/convert').exists()) {
        magick = path + '/';
    }
});

function Image(config) {
    if (config instanceof BufferedImage) {
        this.image = config;
    }
    else if (config instanceof java.awt.Image) {
        this.image = config;
    }
    else {
        switch (toString.apply(config)) {
            case '[object JavaArray]':
                this.image = ImageIO.read(new ByteArrayInputStream(config));
                break;
        }
    }
    if (!this.image) {
        throw new Error('Image format not recognized');
    }
}
decaf.extend(Image.prototype, {
    width: function() {
        return this.image.getWidth();
    },
    height: function() {
        return this.image.getHeight();
    },
    getPropertyNames: function() {
        var props = this.image.getPropertyNames(),
            names = [];
        if (props) {
            for (var i= 0, len = props.length; i<len; i++ ) {
                names.push(String(props[i]));
            }
        }
        return names;
    },
    subImage: function(x,y, w,h) {
        return new Image(this.image.subImage(x,y, w,h));
    },

    SCALE_DEFAULT: java.awt.Image.SCALE_DEFAULT,
    SCALE_FAST: java.awt.Image.SCALE_FAST,
    SCALE_SMOOTH: java.awt.Image.SCALE_SMOOTH,
    SCALE_REPLICATE: java.awt.Image.SCALE_REPLICATE,
    SCALE_AREA_AVERAGING: java.awt.Image.SCALE_AREA_AVERAGING,

    /**
     * Creates a scaled version of this image. A new Image object is returned which will render the image at the specified width and height by default. The new Image object may be loaded asynchronously even if the original source image has already been loaded completely.
     *
     * If either width or height is a negative number then a value is substituted to maintain the aspect ratio of the original image dimensions. If both width and height are negative, then the original image dimensions are used.
     *
     * @chainable
     * @param {int} w
     * @param {int} h
     * @param {int} hint
     */
    scale: function(w, h, hint) {
//        return new Image(this.image.getScaledInstance(w, h, hint || this.SCALE_DEFAULT));
        var img = this.image.getScaledInstance(w, h, hint || this.SCALE_DEFAULT);

//        var at = AffineTransform.getScaleInstance(img.getWidth(), img.getHeight());
//        var ato = new AffineTransformOp(at, AffineTransformOp.TYPE_BICUBIC);
//        var destImage = ato.createCompatibleDestImage(img, null);
//        ato.filter(image, destImage);
//        return new Image(destImage);

        var bi = new BufferedImage(img.getWidth(), img.getHeight(), BufferedImage.TYPE_4BYTE_ABGR);
        var g = bi.createGraphics();
        g.drawImage(img, null, null);
        this.image = bi;
        return this;
    },

    toByteArray: function(format) {
        format = format || 'gif';
        console.log(format);
        var os = new ByteArrayOutputStream;
        ImageIO.write(this.image, format, os);
        return os.toByteArray();


    },

    save: function(fn, format) {
//        ImageIO.write(bImageFromConvert, "gif", new File("c:/test.gif"));
        ImageIO.write(this.image, format || "gif", new java.io.File(fn));
    }

});

module.exports = Image;


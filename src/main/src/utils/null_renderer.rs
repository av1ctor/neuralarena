use brains_engine::renderer::{
    ModelRef, 
    Renderer
};
use three_rs::{
    core::RGB, 
    object::Mesh, 
    math::{Triangle, Vector3, Quaternion, Euler}
};

pub struct NullRenderer {
}

impl NullRenderer {
    pub fn new(
    ) -> Self {
        Self {
        }
    }
}

impl Renderer for NullRenderer {
    fn reset(
        &mut self
    ) {
    }

    fn add_from_file(
        &mut self,
        _name: &str
    ) -> Result<ModelRef, String> {
        Ok(0)
    }

    fn add_from_bytes(
        &mut self,
        _bytes: &[u8]
    ) -> Result<ModelRef, String> {
        Ok(0)
    }

    #[cfg(not(target_arch = "wasm32"))]
    fn add_from_gltf(
        &mut self,
        _doc: &gltf::Document,
        _buffers: &Vec<gltf::buffer::Data>
    ) -> Result<ModelRef, String> {
        Ok(0)
    }

    fn add_from_mesh(
        &mut self,
        _color: RGB,
        _mesh: std::rc::Rc<std::cell::RefCell<Mesh>>
    ) -> Result<ModelRef, String> {
        Ok(0)
    }

    fn add_from_triangles(
        &mut self,
        _color: RGB,
        _triangles: Vec<Triangle>
    ) -> Result<ModelRef, String> {
        Ok(0)
    }

    fn add_from_linestrips(
        &mut self,
        _color: RGB,
        _vertices: Vec<Vector3>
    ) -> Result<ModelRef, String> {
        Ok(0)
    }

    fn add_from_lines(
        &mut self,
        _color: RGB,
        _vertices: Vec<Vector3>
    ) -> Result<ModelRef, String> {
        Ok(0)
    }

    fn show_model(
        &mut self,
        _model_ref: ModelRef
    ) {
    }

    fn hide_model(
        &mut self,
        _model_ref: ModelRef
    ) {
    }

    fn set_vertices(
        &mut self,
        _model_ref: ModelRef,
        _vertices: Vec<Vector3>
    ) {
    }

    fn set_position(
        &mut self,
        _model_ref: ModelRef,
        _pos: &Vector3
    ) {
    }

    fn set_rotation(
        &mut self,
        _model_ref: ModelRef,
        _q: &Quaternion
    ) {
    }

    fn set_rotation_from_euler(
        &mut self,
        _model_ref: ModelRef,
        _euler: &Euler
    ) {
    }

    fn set_scale(
        &mut self,
        _model_ref: ModelRef,
        _scale: &Vector3
    ) {
    }

    fn render(
        &mut self
    ) {
    }
}
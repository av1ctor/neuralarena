use rand::{rngs::StdRng, Rng};
use crate::nn::tensor::Tensor;
use crate::dqn::dqn::{DqnOptions, DeepQNetwork};

#[derive(Clone)]
pub struct BaseAgentOptions {
    pub dqn: DqnOptions,
    pub rng: StdRng,
    pub epsilon: f64,
}

#[derive(Clone)]
pub struct BaseAgent {
    pub options: BaseAgentOptions,
    pub q_eval: DeepQNetwork,
}

impl BaseAgent {
    pub fn new(
        options: &BaseAgentOptions
    ) -> Self {
        let q_eval = DeepQNetwork::new(&options.dqn);
        
        Self {
            options: options.clone(),
            q_eval,
        }
    }

    pub fn choose_action(
        &mut self, 
        obs: Tensor
    ) -> Option<usize> {
        if self.options.rng.gen::<f64>() > self.options.epsilon {
            let actions = &self.q_eval.forward(obs);
            Some(actions.argmax())
        }
        else {
            None
        }
    }
    
    pub fn load(
        &mut self,
        buf: &Vec<u8>
    ) -> Result<(), String> {
        self.q_eval.load(buf)
    }
}

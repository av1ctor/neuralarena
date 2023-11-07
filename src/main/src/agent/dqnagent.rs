use crate::agent::baseagent::{BaseAgent, BaseAgentOptions};
use crate::agent::agent::Agent;
use crate::nn::tensor::Tensor;

#[derive(Clone)]
pub struct DqnAgent {
    pub base: BaseAgent,
}

impl Agent for DqnAgent {
    fn new(
        options: &BaseAgentOptions
    ) -> Self {
        Self {
            base: BaseAgent::new(options),
        }
    }

    fn choose_action(
        &mut self, 
        obs: Tensor
    ) -> Option<usize> {
        self.base.choose_action(obs)
    }

    fn load(
        &mut self,
        buf: &Vec<u8>
    ) -> Result<(), String> {
        self.base.load(buf)
    }
}

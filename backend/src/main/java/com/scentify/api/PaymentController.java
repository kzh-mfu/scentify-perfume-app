package com.scentify.api;

import com.scentify.domain.Order;
import com.scentify.domain.Payment;
import com.scentify.repository.OrderRepository;
import com.scentify.repository.PaymentRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/payments")
@org.springframework.context.annotation.Profile("!local")
public class PaymentController {
  private final PaymentRepository payments; private final OrderRepository orders; private final CurrentUser currentUser;
  public PaymentController(PaymentRepository payments,OrderRepository orders,CurrentUser currentUser){this.payments=payments;this.orders=orders;this.currentUser=currentUser;}
  @GetMapping public List<PaymentResponse> list(Authentication auth){currentUser.requireStaff(auth);return payments.findAllByOrderByCreatedAtDesc().stream().map(this::response).toList();}
  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  public PaymentResponse create(Authentication auth,@Valid @RequestBody PaymentRequest r){String uid=currentUser.id(auth);Order o=orders.findById(r.orderId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Order not found."));if(!uid.equals(o.getUserId()))currentUser.requireStaff(auth);if(payments.findByOrderId(o.getId()).isPresent())throw new ResponseStatusException(HttpStatus.CONFLICT,"A payment record already exists for this order.");return response(payments.save(new Payment(o,r.paymentMethod(),r.receiptUrl(),r.transactionReference())));}
 @Transactional
@PatchMapping("/{id}/verify")
public PaymentResponse verify(Authentication auth, @PathVariable Long id) {
    currentUser.requireStaff(auth);

    Payment p = payments.findById(id)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Payment not found."
        ));

    p.setStatus("verified");
    p.setVerifiedAt(OffsetDateTime.now());

    Order order = p.getOrder();
    order.setPaymentStatus("verified");
    order.setVerifiedAt(OffsetDateTime.now());

    orders.save(order);
    return response(payments.save(p));
}
  private PaymentResponse response(Payment p){return new PaymentResponse(p.getId(),p.getOrder().getId(),p.getPaymentMethod(),p.getReceiptUrl(),p.getTransactionReference(),p.getStatus(),p.getVerifiedAt(),p.getCreatedAt());}
  public record PaymentRequest(Long orderId,@NotBlank String paymentMethod,String receiptUrl,String transactionReference){}
  public record PaymentResponse(Long paymentId,Long orderId,String paymentMethod,String receiptUrl,String transactionReference,String status,OffsetDateTime verifiedAt,OffsetDateTime createdAt){}
}

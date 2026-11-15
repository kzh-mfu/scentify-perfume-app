package com.scentify.api;

import com.scentify.domain.Order;
import com.scentify.domain.Shipping;
import com.scentify.repository.OrderRepository;
import com.scentify.repository.ShippingRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/shipping")
@org.springframework.context.annotation.Profile("!local")
public class ShippingController {
  private final ShippingRepository shippings; private final OrderRepository orders; private final CurrentUser currentUser;
  public ShippingController(ShippingRepository shippings,OrderRepository orders,CurrentUser currentUser){this.shippings=shippings;this.orders=orders;this.currentUser=currentUser;}
  @GetMapping public List<ShippingResponse> list(Authentication auth){currentUser.requireStaff(auth);return shippings.findAllByOrderByIdDesc().stream().map(this::response).toList();}
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public ShippingResponse create(Authentication auth,@Valid @RequestBody ShippingRequest r){currentUser.requireStaff(auth);Order o=orders.findById(r.orderId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Order not found."));if(shippings.findByOrderId(o.getId()).isPresent())throw new ResponseStatusException(HttpStatus.CONFLICT,"Shipping already exists for this order.");return response(shippings.save(new Shipping(o,r.shippingFee(),r.shippingAddress())));}
  @PatchMapping("/{id}") public ShippingResponse update(Authentication auth,@PathVariable Long id,@Valid @RequestBody ShippingUpdate r){currentUser.requireStaff(auth);Shipping s=shippings.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Shipping not found."));if(r.courierName()!=null)s.setCourierName(r.courierName());if(r.trackingNumber()!=null)s.setTrackingNumber(r.trackingNumber());if(r.shippingStatus()!=null){s.setShippingStatus(r.shippingStatus());if("shipped".equals(r.shippingStatus()))s.setShippedAt(OffsetDateTime.now());if("delivered".equals(r.shippingStatus()))s.setDeliveredAt(OffsetDateTime.now());}return response(shippings.save(s));}
  private ShippingResponse response(Shipping s){return new ShippingResponse(s.getId(),s.getOrder().getId(),s.getShippingFee(),s.getTrackingNumber(),s.getCourierName(),s.getShippingAddress(),s.getShippingStatus(),s.getShippedAt(),s.getDeliveredAt());}
  public record ShippingRequest(@NotNull Long orderId,@NotNull @DecimalMin("0.00") BigDecimal shippingFee,@NotBlank String shippingAddress){}
  public record ShippingUpdate(String trackingNumber,String courierName,String shippingStatus){}
  public record ShippingResponse(Long shippingId,Long orderId,BigDecimal shippingFee,String trackingNumber,String courierName,String shippingAddress,String shippingStatus,OffsetDateTime shippedAt,OffsetDateTime deliveredAt){}
}
